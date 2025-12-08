<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            
            $table->decimal('price', 10, 2)->index(); // Index on price for filtering
            
            // FK with index (Best practice for Postgres)
            $table->foreignId('category_id')
                ->constrained()
                ->onDelete('cascade'); 
            // index for category_id
            $table->index('category_id'); 

            $table->json('tags')->nullable();
            
            $table->timestamps();
            
            // Index for sorting (created_at is created by timestamps())
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
