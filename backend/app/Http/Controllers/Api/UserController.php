<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        return User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'phone', 'created_at'])
            ->map(fn (User $user) => $this->payload($user));
    }

    public function store(Request $request)
    {
        $data = $this->validateUser($request);
        $user = User::query()->create($data);

        return $this->payload($user);
    }

    public function update(Request $request, User $user)
    {
        $data = $this->validateUser($request, $user);
        if ($user->role === 'super_admin' && $data['role'] !== 'super_admin') {
            $this->guardLastSuperAdmin();
        }
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);

        return $this->payload($user->fresh());
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()?->id === $user->id) {
            throw ValidationException::withMessages([
                'user' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ]);
        }
        if ($user->role === 'super_admin') {
            $this->guardLastSuperAdmin();
        }
        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }

    private function validateUser(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:10', 'max:255'],
            'role' => ['required', 'in:admin,super_admin'],
            'phone' => ['nullable', 'string', 'max:30'],
        ], [
            'password.min' => 'Le mot de passe doit contenir au moins 10 caractères.',
            'email.unique' => 'Cet email est déjà utilisé.',
        ]);
    }

    private function guardLastSuperAdmin(): void
    {
        if (User::query()->where('role', 'super_admin')->count() <= 1) {
            throw ValidationException::withMessages([
                'role' => 'Il doit rester au moins un super admin.',
            ]);
        }
    }

    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'created_at' => $user->created_at,
        ];
    }
}
