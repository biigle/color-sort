<?php

use Illuminate\Database\QueryException;

class CopriaColorSortModuleConsoleCommandsInstallTest extends TestCase {

    public function tearDown()
    {
        Artisan::call('copria-color-sort:uninstall');
        parent::tearDown();
    }

    public function testCommandExists()
    {
        Artisan::call('list');
        $this->assertContains('copria-color-sort:install', Artisan::output());
    }

    public function testCommandHandle()
    {
        $this->assertFalse(Schema::hasTable('copria_color_sort_sequence'));
        Artisan::call('copria-color-sort:install');
        $this->assertTrue(Schema::hasTable('copria_color_sort_sequence'));
    }

    public function testCommandHandleMultiple()
    {
        // there should be no error if the table already exists
        Artisan::call('copria-color-sort:install');
        Artisan::call('copria-color-sort:install');
    }
}
