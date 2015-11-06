<?php

class CopriaColorSortModuleConsoleCommandsUninstallTest extends TestCase {
    public function testCommandExists() {
        Artisan::call('list');
        $this->assertContains('copria-color-sort:uninstall', Artisan::output());
    }

    public function testCommandHandle() {
        Artisan::call('copria-color-sort:install');
        $this->assertTrue(Schema::hasTable('copria_color_sort_sequence'));
        Artisan::call('copria-color-sort:uninstall');
        $this->assertFalse(Schema::hasTable('copria_color_sort_sequence'));
    }

    public function testCommandHandleTableNotThere() {
        // shouldn't fail
        Artisan::call('copria-color-sort:uninstall');
    }
}
