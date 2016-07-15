<?php

use Dias\Modules\Copria\ColorSort\Listeners\ImagesCreatedListener;

class CopriaColorSortModuleListenersImagesCreatedListenerTest extends TestCase
{
    public function testHandle()
    {
        $sequence = CopriaColorSortModuleSequenceTest::create();
        with(new ImagesCreatedListener)->handle($sequence->transect_id, []);
        $this->assertNull($sequence->fresh());
    }
}
