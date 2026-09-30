<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasUuids;

    protected $fillable = ['first_name', 'last_name', 'email', 'phone'];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
