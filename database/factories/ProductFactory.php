<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 5, 500), // random price between 5 and 500 (could change obv)
            'tags' => fake()->randomElements(['promo', 'new', 'limited', 'best-seller'], 2),
            'category_id' => 1, // placeholder, will be set in seeder
        ];
    }
}