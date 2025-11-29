<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Models\Category;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Categories routes
Route::get('/categories', function () {
    return Category::all();
});

// Products routes
Route::apiResource('products', ProductController::class);
