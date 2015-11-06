<?php

use Dias\Modules\Copria\ColorSort\Transect;

class CopriaColorSortModuleTransectTest extends TestCase {

    public function setUp()
    {
        parent::setUp();
        Artisan::call('copria-color-sort:install');
    }

    public function tearDown()
    {
        Artisan::call('copria-color-sort:uninstall');
        parent::tearDown();
    }

    public function testColorSortSequences()
    {
        $t = Transect::find(TransectTest::create()->id);
        $s = CopriaColorSortModuleSequenceTest::create(['transect_id' => $t->id]);
        $this->assertEquals($s->id, $t->colorSortSequences()->first()->id);
    }
}
