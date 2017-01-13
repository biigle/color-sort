<?php

namespace Biigle\Tests\Modules\CopriaColorSort;

use TestCase;
use Biigle\Modules\Copria\ColorSort\Volume;
use Biigle\Tests\VolumeTest as BaseVolumeTest;

class VolumeTest extends TestCase
{
    public function testConvert()
    {
        $volume = BaseVolumeTest::create();
        $copriaVolume = Volume::convert($volume);
        $this->assertEquals($volume->id, $copriaVolume->id);
        $this->assertTrue($copriaVolume instanceof Volume);
    }

    public function testColorSortSequences()
    {
        $t = Volume::find(BaseVolumeTest::create()->id);
        $s = SequenceTest::create(['volume_id' => $t->id]);
        $this->assertEquals($s->id, $t->colorSortSequences()->first()->id);
    }
}
