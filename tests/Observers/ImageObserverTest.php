<?php

namespace Dias\Tests\Modules\CopriaColorSort\Observers;

use TestCase;
use Dias\Tests\ImageTest;
use Dias\Tests\TransectTest;
use Dias\Tests\Modules\CopriaColorSort\SequenceTest;

class ImageObserverTest extends TestCase
{
    public function testDeleted()
    {
        $transect = TransectTest::create();
        $image1 = ImageTest::create(['transect_id' => $transect->id, 'filename' => 'a.jpg']);
        $image2 = ImageTest::create(['transect_id' => $transect->id, 'filename' => 'b.jpg']);
        $sequence = SequenceTest::make(['transect_id' => $transect->id]);
        $sequence->sequence = [$image1->id, $image2->id];
        $sequence->save();

        $image2->delete();
        $this->assertNotContains($image2->id, $sequence->fresh()->sequence);
        $image1->delete();
        $this->assertNotContains($image1->id, $sequence->fresh()->sequence);
    }

    public function testDeletedSpecialSequences()
    {
        $transect = TransectTest::create();
        $image = ImageTest::create(['transect_id' => $transect->id, 'filename' => 'a.jpg']);
        // $sequence->sequence is still null!
        $sequence = SequenceTest::create(['transect_id' => $transect->id]);
        // shouldn't fail
        $image->delete();
    }
}
