<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    // Questo resetta il DB a ogni test per partire puliti
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Creiamo una categoria base per i test
        Category::factory()->create(['id' => 1, 'name' => 'Tech']);
    }

    public function test_can_list_products()
    {
        // Creiamo 3 prodotti
        Product::factory()->count(3)->create(['category_id' => 1]);

        // Chiamiamo l'API
        $response = $this->getJson('/api/products');

        // Verifichiamo che risponda 200 OK e abbia la struttura dati corretta
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'price', 'tags', 'category']
                     ],
                     // Laravel standard pagination keys (non sono dentro 'meta')
                     'current_page',
                     'last_page',
                     'total',
                     'per_page'
                 ]);
    }

    public function test_can_filter_products_by_name()
    {
        // Creiamo due prodotti con nomi diversi
        Product::factory()->create(['name' => 'iPhone 15', 'category_id' => 1]);
        Product::factory()->create(['name' => 'Samsung Galaxy', 'category_id' => 1]);

        // Cerchiamo "iPhone"
        $response = $this->getJson('/api/products?search=iPhone');

        // Deve trovarne solo 1
        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment(['name' => 'iPhone 15']);
    }

    public function test_can_create_product()
    {
        $payload = [
            'name' => 'Nuovo Prodotto',
            'price' => 99.99,
            'category_id' => 1,
            'tags' => ['nuovo', 'test']
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Nuovo Prodotto']);

        // Verifichiamo che sia davvero nel DB
        $this->assertDatabaseHas('products', ['name' => 'Nuovo Prodotto']);
    }

    public function test_validation_works()
    {
        // Proviamo a creare un prodotto senza nome
        $response = $this->postJson('/api/products', [
            'price' => 100,
            'category_id' => 1
        ]);

        // Deve fallire con errore 422
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    public function test_can_delete_product()
    {
        $product = Product::factory()->create(['category_id' => 1]);

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(204); // 204 No Content

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}