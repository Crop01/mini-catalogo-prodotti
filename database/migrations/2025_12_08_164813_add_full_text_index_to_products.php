<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Creiamo un indice GIN sulla colonna name trasformata in vettori (usiamo 'simple' per non legarci alla lingua inglese/italiana)
        DB::statement("CREATE INDEX products_name_gin_index ON products USING GIN (to_tsvector('simple', name));");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS products_name_gin_index");
    }
};
