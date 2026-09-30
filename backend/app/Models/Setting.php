<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = ['id', 'allowed_durations', 'timezone'];

    protected function casts(): array
    {
        return [
            'allowed_durations' => 'array',
        ];
    }
}
