<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateColorSortSequencesTable extends Migration
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

            $table->integer('transect_id')->unsigned();
            $table->foreign('transect_id')
              ->references('id')
              ->on('transects')
              // if the transect is deleted, the color sort information should be deleted, too
              ->onDelete('cascade');

            // hex color like BADA55
            $table->string('color', 6);
            // the sequence of image IDs when sorted by this color
            $table->json('sequence')->nullable();

            $table->index(['transect_id', 'color']);
            $table->unique(['transect_id', 'color']);
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
