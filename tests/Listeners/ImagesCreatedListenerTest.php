<?php

namespace Biigle\Tests\Modules\ColorSort\Listeners;

use TestCase;
use Biigle\Tests\Modules\ColorSort\SequenceTest;
use Biigle\Modules\ColorSort\Listeners\ImagesCreatedListener;

class ImagesCreatedListenerTest extends TestCase
{
    public function testHandle()
    {
        $sequence = SequenceTest::create();
        with(new ImagesCreatedListener)->handle($sequence->volume_id, []);
        $this->assertNull($sequence->fresh());
    }
}
