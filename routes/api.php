<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Models\Category;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Categories routes, with product count to optimize frontend
Route::get('/categories', function () {
    return \App\Models\Category::withCount('products')->get();
});

// Products routes
Route::apiResource('products', ProductController::class);
