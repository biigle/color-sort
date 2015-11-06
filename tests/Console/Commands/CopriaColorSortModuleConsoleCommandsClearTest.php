<?php

class CopriaColorSortModuleConsoleCommandsClearTest extends TestCase {

    public function tearDown()
    {
        Artisan::call('copria-color-sort:uninstall');
        parent::tearDown();
    }

    public function testCommandExists()
    {
        Artisan::call('list');
        $this->assertContains('copria-color-sort:clear', Artisan::output());
    }

    public function testCommandHandle()
    {
        Artisan::call('copria-color-sort:install');
        $transect = TransectTest::create();
        $id = DB::table('copria_color_sort_sequence')->insertGetId([
            'transect_id' => $transect->id,
            'color' => 'C0FFEE',
        ]);
        Artisan::call('copria-color-sort:clear');
        $this->assertNull(DB::table('copria_color_sort_sequence')->find($id));
    }

    public function testCommandHandleTableNotThere()
    {
        // shouldn't fail
        Artisan::call('copria-color-sort:clear');
    }
}
