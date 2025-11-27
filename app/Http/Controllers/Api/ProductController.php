<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Product listing with search, filter, sort, and pagination
    public function index(Request $request)
    {
        $query = Product::with('category'); // Eager loading for performance

        // 1. Text Search (Case insensitive for Postgres)
        if ($request->has('search')) {
            $query->where('name', 'ilike', '%' . $request->search . '%');
        }

        // 2. Category Filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // 3. Price Filter (Min/Max)
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // 4. Sorting
        $sortField = $request->input('sort_by', 'created_at'); // Default: date
        $sortDir = $request->input('sort_dir', 'desc'); // Default: descending

        // Simple protection on sortable fields
        if (in_array($sortField, ['price', 'created_at', 'name'])) {
            $query->orderBy($sortField, $sortDir);
        }

        // 5. Pagination (10 per page by default)
        return response()->json($query->paginate(10));
    }

    // Creation
    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());
        return response()->json($product, 201);
    }

    // Single Product
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    // Update
    public function update(StoreProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());
        return response()->json($product);
    }

    // Elimination
    public function destroy($id)
    {
        Product::destroy($id);
        return response()->json(null, 204);
    }
}
