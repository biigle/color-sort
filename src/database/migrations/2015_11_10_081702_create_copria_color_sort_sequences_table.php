<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCopriaColorSortSequencesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        /*
        | This table stores all sequences of image IDs, when the images should be sorted according
        | to a certain color. The attributes are the transect ID, the images belong to, the color
        | as hex value and the sequence of image IDs as JSON array.
        */
        Schema::create('copria_color_sort_sequence', function (Blueprint $table) {
            $table->increments('id');

            // Make this compatible with instances where this module is added *after*
            // transects has been renamed to volumes.
            $volumeName = 'volume';
            if (Schema::hasTable('transects')) {
                $volumeName = 'transect';
            }

            $table->integer("{$volumeName}_id")->unsigned();
            $table->foreign("{$volumeName}_id")
              ->references('id')
              ->on("{$volumeName}s")
              // if the transect is deleted, the color sort information should be deleted, too
              ->onDelete('cascade');

            // hex color like BADA55
            $table->string('color', 6);
            // the sequence of image IDs when sorted by this color
            $table->json('sequence')->nullable();

            $table->index(["{$volumeName}_id", 'color']);
            $table->unique(["{$volumeName}_id", 'color']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('copria_color_sort_sequence');
    }
}
