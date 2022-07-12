<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameTransectColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasColumn('copria_color_sort_sequence', 'transect_id')) {
            Schema::table('copria_color_sort_sequence', function (Blueprint $table) {
                $table->renameColumn('transect_id', 'volume_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('copria_color_sort_sequence', 'volume_id')) {
            Schema::table('copria_color_sort_sequence', function (Blueprint $table) {
                $table->renameColumn('volume_id', 'transect_id');
            });
        }
    }
}
