<?php

namespace Dias\Modules\Copria\ColorSort\Console\Commands;

use Illuminate\Console\Command;
use Dias\Modules\Copria\ColorSort\Sequence;
use Schema;
use Illuminate\Database\Schema\Blueprint;

class Install extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'copria-color-sort:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up the database with the required tables of the Copria color sort package.';

    /**
     * Execute the command.
     *
     * @return void
     */
    public function handle()
    {
        if (!Schema::hasTable(Sequence::DB_TABLE_NAME)) {
            Schema::create(Sequence::DB_TABLE_NAME, function (Blueprint $table) {
                $table->increments('id');

                $table->integer('transect_id')->unsigned();
                $table->foreign('transect_id')
                  ->references('id')
                  ->on('transects')
                  // if the transect is deleted, the color sort information should be deleted, too
                  ->onDelete('cascade');

                // hex color like BADA55
                $table->string('color', 6);
                // token used to authenticate the response from Copria
                $table->string('token')->nullable()->index();
                // the sequence of image IDs when sorted by this color
                $table->json('sequence')->nullable();

                $table->index(['transect_id', 'color']);
            });

            $this->info('Created '.Sequence::DB_TABLE_NAME.' DB table');
        } else {
            $this->comment('The '.Sequence::DB_TABLE_NAME.' DB table already exists');
            $this->info('Nothing was changed.');
        }
    }
}
