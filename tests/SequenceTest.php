<?php

namespace Biigle\Tests\Modules\ColorSort;

use Biigle\Modules\ColorSort\Sequence;
use Biigle\Tests\VolumeTest;
use Str;
use TestCase;

class SequenceTest extends TestCase
{
    public static function make($params = [])
    {
        $s = new Sequence;
        $s->volume_id = isset($params['volume_id']) ? $params['volume_id'] : VolumeTest::create()->id;
        $s->color = Str::random(6);

        return $s;
    }

    public static function create($params = [])
    {
        $s = static::make($params);
        $s->save();

        return $s;
    }

    public function testVolumeOnDeleteCascade()
    {
        $s = static::create();
        $s->volume()->delete();
        $this->assertNull($s->fresh());
    }

    public function testCastSequence()
    {
        $s = static::make();
        $s->sequence = [1, 2, 3];
        $s->save();
        $this->assertEquals([1, 2, 3], $s->fresh()->sequence);
    }
}
