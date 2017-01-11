<?php

namespace Biigle\Tests\Modules\CopriaColorSort\Listeners;

use TestCase;
use Biigle\Tests\Modules\CopriaColorSort\SequenceTest;
use Biigle\Modules\Copria\ColorSort\Listeners\ImagesCreatedListener;

class ImagesCreatedListenerTest extends TestCase
{
    public function testHandle()
    {
        $sequence = SequenceTest::create();
        with(new ImagesCreatedListener)->handle($sequence->transect_id, []);
        $this->assertNull($sequence->fresh());
    }
}
