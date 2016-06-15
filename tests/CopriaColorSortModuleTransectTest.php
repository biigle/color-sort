<?php

use Dias\Modules\Copria\ColorSort\Transect;

class CopriaColorSortModuleTransectTest extends TestCase {

    public function testConvert()
    {
        $transect = TransectTest::create();
        $copriaTransect = Transect::convert($transect);
        $this->assertEquals($transect->id, $copriaTransect->id);
        $this->assertTrue($copriaTransect instanceof Transect);
    }

    public function testColorSortSequences()
    {
        $t = Transect::find(TransectTest::create()->id);
        $s = CopriaColorSortModuleSequenceTest::create(['transect_id' => $t->id]);
        $this->assertEquals($s->id, $t->colorSortSequences()->first()->id);
    }
}
