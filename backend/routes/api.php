<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicController;
use Illuminate\Support\Facades\Route;

Route::get('/faqs', [PublicController::class, 'faqs']);
Route::get('/settings', [PublicController::class, 'settings']);
Route::get('/slots', [PublicController::class, 'slots']);
Route::post('/appointments', [PublicController::class, 'storeAppointment']);
Route::get('/appointments/manage/{token}', [PublicController::class, 'showAppointment']);
Route::post('/appointments/manage/{token}', [PublicController::class, 'manageAppointment']);
Route::post('/messages', [PublicController::class, 'storeMessage']);
Route::get('/articles', [PublicController::class, 'articles']);
Route::get('/articles/{slug}', [PublicController::class, 'article']);
Route::get('/categories', [PublicController::class, 'categories']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/appointments', [AdminController::class, 'appointments']);
        Route::patch('/appointments/{appointment}', [AdminController::class, 'updateAppointment']);
        Route::delete('/appointments/{appointment}', [AdminController::class, 'deleteAppointment']);
        Route::get('/clients', [AdminController::class, 'clients']);
        Route::delete('/clients/{client}', [AdminController::class, 'deleteClient']);
        Route::get('/windows', [AdminController::class, 'windows']);
        Route::post('/windows', [AdminController::class, 'storeWindow']);
        Route::patch('/windows/{window}', [AdminController::class, 'updateWindow']);
        Route::delete('/windows/{window}', [AdminController::class, 'deleteWindow']);
        Route::get('/blocked', [AdminController::class, 'blocked']);
        Route::post('/blocked', [AdminController::class, 'storeBlocked']);
        Route::delete('/blocked/{slot}', [AdminController::class, 'deleteBlocked']);
        Route::patch('/settings', [AdminController::class, 'updateDurations']);
        Route::get('/messages', [AdminController::class, 'messages']);
        Route::patch('/messages/{message}', [AdminController::class, 'updateMessage']);
        Route::delete('/messages/{message}', [AdminController::class, 'deleteMessage']);
    });
});
