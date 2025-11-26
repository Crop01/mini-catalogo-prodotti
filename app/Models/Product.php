<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price', 'tags', 'category_id'];

    // Casting: converts 'tags' to array and 'price' to float
    protected $casts = [
        'tags' => 'array',
        'price' => 'float',
        'created_at' => 'datetime',
    ];

    // Relationship: A product belongs to a category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
