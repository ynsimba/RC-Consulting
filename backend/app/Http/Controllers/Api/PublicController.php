<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Message;
use App\Models\Setting;
use App\Services\BookingService;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function __construct(private BookingService $bookings) {}

    public function faqs()
    {
        return Faq::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function settings()
    {
        return Setting::query()->findOrFail(1);
    }

    public function slots(Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'duration' => ['required', 'integer', 'min:1'],
        ]);

        return [
            'slots' => $this->bookings->slots($data['date'], (int) $data['duration']),
        ];
    }

    public function storeAppointment(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'min:2', 'max:80'],
            'last_name' => ['required', 'string', 'min:2', 'max:80'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'min:3', 'max:200'],
            'description' => ['required', 'string', 'min:5', 'max:5000'],
            'duration' => ['required', 'integer'],
            'starts_at' => ['required', 'date'],
            'type' => ['nullable', 'in:cabinet,phone,video'],
        ]);

        return $this->bookings->create($data);
    }

    public function showAppointment(string $token)
    {
        $appointment = $this->bookings->findByToken($token);
        abort_if(! $appointment, 404);

        return $appointment;
    }

    public function manageAppointment(Request $request, string $token)
    {
        $data = $request->validate([
            'action' => ['required', 'in:cancel,reschedule'],
            'starts_at' => ['nullable', 'date'],
            'duration' => ['nullable', 'integer'],
        ]);

        return $this->bookings->manage(
            $token,
            $data['action'],
            $data['starts_at'] ?? null,
            isset($data['duration']) ? (int) $data['duration'] : null,
        );
    }

    public function storeMessage(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        return Message::query()->create($data);
    }

    public function articles(Request $request)
    {
        $pageSize = 9;
        $query = Article::query()
            ->with('category:id,name,slug')
            ->where('published', true)
            ->orderByDesc('published_at');

        if ($search = $request->string('q')->trim()->toString()) {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->trim()->toString()) {
            $query->whereHas('category', fn ($builder) => $builder->where('slug', $category));
        }

        $page = max(1, (int) $request->input('page', 1));
        $paginator = $query->paginate($pageSize, ['*'], 'page', $page);

        return [
            'items' => $paginator->items(),
            'page' => $paginator->currentPage(),
            'totalPages' => max(1, $paginator->lastPage()),
        ];
    }

    public function article(string $slug)
    {
        return Article::query()
            ->with('category:id,name,slug')
            ->where('slug', $slug)
            ->where('published', true)
            ->firstOrFail();
    }

    public function categories()
    {
        return Category::query()->orderBy('name')->get();
    }
}
