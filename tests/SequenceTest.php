<?php

namespace Biigle\Tests\Modules\CopriaColorSort;

use TestCase;
use Biigle\Tests\VolumeTest;
use Biigle\Modules\Copria\ColorSort\Sequence;

class SequenceTest extends TestCase
{
    public static function make($params = [])
    {
        $s = new Sequence;
        $s->volume_id = isset($params['volume_id']) ? $params['volume_id'] : VolumeTest::create()->id;
        $s->color = str_random(6);

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
        if ($this->isSqlite()) {
            $this->markTestSkipped('Can\'t test with SQLite because altering foreign key constraints is not supported.');
        }
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
