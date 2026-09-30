<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AvailabilityWindow;
use App\Models\BlockedSlot;
use App\Models\Client;
use App\Models\Message;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        $now = now();

        return [
            'upcoming' => Appointment::query()
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('starts_at', '>=', $now)
                ->count(),
            'pending' => Appointment::query()->where('status', 'pending')->count(),
            'appointmentsMonth' => Appointment::query()
                ->whereBetween('starts_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
                ->count(),
            'clientsTotal' => Client::query()->count(),
            'messagesUnread' => Message::query()->where('read', false)->count(),
            'appointmentsTotal' => Appointment::query()->count(),
        ];
    }

    public function appointments(Request $request)
    {
        $query = Appointment::query()->with('client')->orderBy('starts_at');

        if ($request->filled('from')) {
            $query->where('starts_at', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->where('starts_at', '<=', $request->date('to'));
        }
        if ($request->filled('status')) {
            $query->whereIn('status', (array) $request->input('status'));
        }

        return $query->get();
    }

    public function updateAppointment(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,confirmed,refused,cancelled,completed'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date'],
            'duration' => ['sometimes', 'integer', 'min:1'],
            'subject' => ['sometimes', 'string', 'max:200'],
            'description' => ['sometimes', 'string'],
            'type' => ['sometimes', 'in:cabinet,phone,video'],
        ]);

        $appointment->update($data);

        return $appointment->fresh('client');
    }

    public function deleteAppointment(Appointment $appointment)
    {
        $appointment->delete();

        return response()->noContent();
    }

    public function clients()
    {
        return Client::query()->orderByDesc('created_at')->get();
    }

    public function deleteClient(Client $client)
    {
        $client->delete();

        return response()->noContent();
    }

    public function windows()
    {
        return AvailabilityWindow::query()->orderBy('day_of_week')->orderBy('start_time')->get();
    }

    public function storeWindow(Request $request)
    {
        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        return AvailabilityWindow::query()->create([...$data, 'is_active' => true]);
    }

    public function updateWindow(Request $request, AvailabilityWindow $window)
    {
        $data = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $window->update($data);

        return $window->fresh();
    }

    public function deleteWindow(AvailabilityWindow $window)
    {
        $window->delete();

        return response()->noContent();
    }

    public function blocked(Request $request)
    {
        $query = BlockedSlot::query()->orderBy('date');
        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->input('to'));
        }

        return $query->get();
    }

    public function storeBlocked(Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        return BlockedSlot::query()->create($data);
    }

    public function deleteBlocked(BlockedSlot $slot)
    {
        $slot->delete();

        return response()->noContent();
    }

    public function updateDurations(Request $request)
    {
        $data = $request->validate([
            'allowed_durations' => ['required', 'array', 'min:1'],
            'allowed_durations.*' => ['integer', 'min:1'],
        ]);

        $settings = Setting::query()->findOrFail(1);
        $settings->update(['allowed_durations' => array_values($data['allowed_durations'])]);

        return $settings->fresh();
    }

    public function messages()
    {
        return Message::query()->orderByDesc('created_at')->get();
    }

    public function updateMessage(Request $request, Message $message)
    {
        $data = $request->validate([
            'read' => ['required', 'boolean'],
        ]);
        $message->update($data);

        return $message->fresh();
    }

    public function deleteMessage(Message $message)
    {
        $message->delete();

        return response()->noContent();
    }
}
