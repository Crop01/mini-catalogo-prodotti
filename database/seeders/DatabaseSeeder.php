<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // I create 5 Categories
        $categories = \App\Models\Category::factory(5)->create();

        // I create 50 Products assigned to random categories
        \App\Models\Product::factory(50)->make()->each(function ($product) use ($categories) {
            $product->category_id = $categories->random()->id;
            $product->save();
        });
    }
}
