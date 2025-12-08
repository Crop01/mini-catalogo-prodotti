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
        $query = Product::with('category');

        // 1. Ricerca Testuale
        if ($request->filled('search')) {
            $query->where('name', 'ilike', '%' . $request->search . '%');
        }

        // 2. Filtro Categoria
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // 3. Filtro Prezzo Minimo
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        // 4. Filtro Prezzo Massimo (AGGIUNTO ORA)
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // 5. Ordinamento
        $sortField = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        
        if (in_array($sortField, ['price', 'created_at', 'name'])) {
            $query->orderBy($sortField, $sortDir);
        }

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
