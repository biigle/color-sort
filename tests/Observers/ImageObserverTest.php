<?php

namespace Biigle\Tests\Modules\ColorSort\Observers;

use TestCase;
use Biigle\Tests\ImageTest;
use Biigle\Tests\VolumeTest;
use Biigle\Tests\Modules\ColorSort\SequenceTest;

class ImageObserverTest extends TestCase
{
    public function testDeleted()
    {
        $volume = VolumeTest::create();
        $image1 = ImageTest::create(['volume_id' => $volume->id, 'filename' => 'a.jpg']);
        $image2 = ImageTest::create(['volume_id' => $volume->id, 'filename' => 'b.jpg']);
        $sequence = SequenceTest::make(['volume_id' => $volume->id]);
        $sequence->sequence = [$image1->id, $image2->id];
        $sequence->save();

        $image2->delete();
        $this->assertNotContains($image2->id, $sequence->fresh()->sequence);
        $image1->delete();
        $this->assertNotContains($image1->id, $sequence->fresh()->sequence);
    }

    public function testDeletedSpecialSequences()
    {
        $volume = VolumeTest::create();
        $image = ImageTest::create(['volume_id' => $volume->id, 'filename' => 'a.jpg']);
        // $sequence->sequence is still null!
        $sequence = SequenceTest::create(['volume_id' => $volume->id]);
        // shouldn't fail
        $image->delete();
        // Add assertion so this test isn't marked as risky.
        $this->assertTrue(true);
    }
}
