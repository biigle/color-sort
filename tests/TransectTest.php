<?php

namespace Biigle\Tests\Modules\CopriaColorSort;

use TestCase;
use Biigle\Modules\Copria\ColorSort\Transect;
use Biigle\Tests\TransectTest as BaseTransectTest;

class TransectTest extends TestCase
{
    public function testConvert()
    {
        $transect = BaseTransectTest::create();
        $copriaTransect = Transect::convert($transect);
        $this->assertEquals($transect->id, $copriaTransect->id);
        $this->assertTrue($copriaTransect instanceof Transect);
    }

    public function testColorSortSequences()
    {
        $t = Transect::find(BaseTransectTest::create()->id);
        $s = SequenceTest::create(['transect_id' => $t->id]);
        $this->assertEquals($s->id, $t->colorSortSequences()->first()->id);
    }
}
