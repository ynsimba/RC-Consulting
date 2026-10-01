<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AvailabilityWindow;
use App\Models\BlockedSlot;
use App\Models\Client;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService
{
    private const TZ = 'Europe/Brussels';

    public function slots(string $date, int $duration, ?string $ignoreId = null): array
    {
        $allowed = Setting::query()->find(1)?->allowed_durations ?? [30, 60];
        if (! in_array($duration, $allowed, true)) {
            return [];
        }

        $day = Carbon::parse($date, self::TZ)->startOfDay();
        $blocked = BlockedSlot::query()->whereDate('date', $day->toDateString())->get();
        if ($blocked->contains(fn (BlockedSlot $slot) => $slot->start_time === null && $slot->end_time === null)) {
            return [];
        }

        $appointments = Appointment::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('starts_at', '<', $day->copy()->endOfDay()->utc())
            ->where('ends_at', '>', $day->copy()->utc())
            ->get();

        $now = Carbon::now(self::TZ);
        $times = [];

        $windows = AvailabilityWindow::query()
            ->where('day_of_week', $day->dayOfWeek)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get();

        foreach ($windows as $window) {
            $cursor = $this->minutes((string) $window->start_time);
            $end = $this->minutes((string) $window->end_time);

            while ($cursor + $duration <= $end) {
                $start = $day->copy()->setTime(intdiv($cursor, 60), $cursor % 60);
                $finish = $start->copy()->addMinutes($duration);

                if (
                    $start->greaterThan($now)
                    && ! $this->overlapsAppointment($appointments, $start, $finish)
                    && ! $this->overlapsBlock($blocked, $cursor, $cursor + $duration)
                ) {
                    $times[] = $start->format('H:i');
                }

                $cursor += 30;
            }
        }

        return $times;
    }

    public function create(array $input): Appointment
    {
        $starts = Carbon::parse($input['starts_at'])->timezone(self::TZ);
        $duration = (int) $input['duration'];

        try {
            return Cache::lock('booking:'.$starts->toDateString(), 10)->block(5, function () use ($input, $starts, $duration) {
                return DB::transaction(function () use ($input, $starts, $duration) {
                    $this->assertSlotOpen($starts, $duration);

                    return $this->store($input, $starts, $duration);
                });
            });
        } catch (LockTimeoutException) {
            throw ValidationException::withMessages([
                'starts_at' => 'Créneau en cours de réservation, réessayez.',
            ]);
        }
    }

    private function store(array $input, Carbon $starts, int $duration): Appointment
    {
        $email = strtolower(trim($input['email']));
        $client = Client::query()->whereRaw('lower(email) = ?', [$email])->first();

        if (! $client) {
            $client = Client::query()->create([
                'first_name' => trim($input['first_name']),
                'last_name' => trim($input['last_name']),
                'email' => $email,
                'phone' => trim((string) ($input['phone'] ?? '')) ?: null,
            ]);
        }

        return Appointment::query()->create([
            'client_id' => $client->id,
            'type' => $input['type'] ?? 'cabinet',
            'duration' => $duration,
            'starts_at' => $starts->copy()->utc(),
            'ends_at' => $starts->copy()->addMinutes($duration)->utc(),
            'subject' => trim($input['subject']),
            'description' => trim((string) ($input['description'] ?? '')),
            'status' => 'pending',
            'manage_token' => (string) Str::uuid(),
        ])->load('client');
    }

    public function findByToken(string $token): ?Appointment
    {
        return Appointment::query()->with('client')->where('manage_token', $token)->first();
    }

    public function manage(string $token, string $action, ?string $startsAt = null, ?int $duration = null): Appointment
    {
        $appointment = $this->findByToken($token);
        if (! $appointment) {
            throw ValidationException::withMessages(['token' => 'Rendez-vous introuvable']);
        }

        if (! in_array($appointment->status, ['pending', 'confirmed'], true) || $appointment->starts_at->lte(now())) {
            throw ValidationException::withMessages([
                'token' => 'Ce rendez-vous ne peut plus être modifié',
            ]);
        }

        if ($action === 'cancel') {
            $appointment->update(['status' => 'cancelled']);

            return $appointment->fresh('client');
        }

        if ($action !== 'reschedule' || ! $startsAt) {
            throw ValidationException::withMessages(['action' => 'Action invalide']);
        }

        $starts = Carbon::parse($startsAt)->timezone(self::TZ);
        $duration = $duration ?: $appointment->duration;

        try {
            return Cache::lock('booking:'.$starts->toDateString(), 10)->block(5, function () use ($appointment, $starts, $duration) {
                return DB::transaction(function () use ($appointment, $starts, $duration) {
                    $this->assertSlotOpen($starts, $duration, $appointment->id);
                    $appointment->update([
                        'duration' => $duration,
                        'starts_at' => $starts->copy()->utc(),
                        'ends_at' => $starts->copy()->addMinutes($duration)->utc(),
                    ]);

                    return $appointment->fresh('client');
                });
            });
        } catch (LockTimeoutException) {
            throw ValidationException::withMessages([
                'starts_at' => 'Créneau en cours de réservation, réessayez.',
            ]);
        }
    }

    private function assertSlotOpen(Carbon $starts, int $duration, ?string $ignoreId = null): void
    {
        if (! in_array($starts->format('H:i'), $this->slots($starts->toDateString(), $duration, $ignoreId), true)) {
            throw ValidationException::withMessages([
                'starts_at' => 'Créneau indisponible',
            ]);
        }
    }

    private function minutes(string $time): int
    {
        [$hour, $minute] = array_map('intval', explode(':', substr($time, 0, 5)));

        return $hour * 60 + $minute;
    }

    private function overlapsAppointment($appointments, Carbon $start, Carbon $finish): bool
    {
        return $appointments->contains(function (Appointment $appointment) use ($start, $finish) {
            return $appointment->starts_at->lt($finish) && $appointment->ends_at->gt($start);
        });
    }

    private function overlapsBlock($blocked, int $start, int $end): bool
    {
        return $blocked->contains(function (BlockedSlot $slot) use ($start, $end) {
            if ($slot->start_time === null || $slot->end_time === null) {
                return false;
            }

            $blockStart = $this->minutes((string) $slot->start_time);
            $blockEnd = $this->minutes((string) $slot->end_time);

            return $start < $blockEnd && $end > $blockStart;
        });
    }
}
