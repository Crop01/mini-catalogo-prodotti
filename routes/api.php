<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Models\Category;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rotta categorie
Route::get('/categories', function () {
    return Category::all();
});

// Rotte prodotti
Route::apiResource('products', ProductController::class);
