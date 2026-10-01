<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/faqs', [PublicController::class, 'faqs']);
Route::get('/settings', [PublicController::class, 'settings']);
Route::get('/slots', [PublicController::class, 'slots']);
Route::post('/appointments', [PublicController::class, 'storeAppointment'])
    ->middleware('throttle:public-write');
Route::get('/appointments/manage/{token}', [PublicController::class, 'showAppointment']);
Route::post('/appointments/manage/{token}', [PublicController::class, 'manageAppointment'])
    ->middleware('throttle:public-write');
Route::post('/messages', [PublicController::class, 'storeMessage'])
    ->middleware('throttle:public-write');
Route::get('/articles', [PublicController::class, 'articles']);
Route::get('/articles/{slug}', [PublicController::class, 'article']);
Route::get('/categories', [PublicController::class, 'categories']);

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

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

        Route::middleware('super')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::patch('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);

            Route::get('/faqs', [ContentController::class, 'faqs']);
            Route::post('/faqs', [ContentController::class, 'storeFaq']);
            Route::patch('/faqs/{faq}', [ContentController::class, 'updateFaq']);
            Route::delete('/faqs/{faq}', [ContentController::class, 'deleteFaq']);

            Route::get('/articles', [ContentController::class, 'articles']);
            Route::post('/articles', [ContentController::class, 'storeArticle']);
            Route::patch('/articles/{article}', [ContentController::class, 'updateArticle']);
            Route::delete('/articles/{article}', [ContentController::class, 'deleteArticle']);

            Route::get('/categories', [ContentController::class, 'categories']);
            Route::post('/categories', [ContentController::class, 'storeCategory']);
            Route::delete('/categories/{category}', [ContentController::class, 'deleteCategory']);
        });
    });
});
