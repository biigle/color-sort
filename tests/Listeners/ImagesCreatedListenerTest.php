<?php

namespace Dias\Tests\Modules\CopriaColorSort\Listeners;

use TestCase;
use Dias\Tests\Modules\CopriaColorSort\SequenceTest;
use Dias\Modules\Copria\ColorSort\Listeners\ImagesCreatedListener;

class ImagesCreatedListenerTest extends TestCase
{
    public function testHandle()
    {
        $sequence = SequenceTest::create();
        with(new ImagesCreatedListener)->handle($sequence->transect_id, []);
        $this->assertNull($sequence->fresh());
    }
}
