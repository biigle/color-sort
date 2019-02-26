<?php

namespace Biigle\Tests\Modules\ColorSort\Jobs;

use App;
use Mockery;
use TestCase;
use Biigle\Tests\ImageTest;
use Biigle\Tests\VolumeTest;
use Biigle\Modules\ColorSort\Support\Sort;
use Biigle\Tests\Modules\ColorSort\SequenceTest;
use Biigle\Modules\ColorSort\Jobs\ComputeNewSequence;

class ComputeNewSequenceTest extends TestCase
{
    public function testHandle()
    {
        $volume = VolumeTest::create(['url' => '/vol/images']);
        ImageTest::create(['volume_id' => $volume->id, 'filename' => 'a.jpg']);
        ImageTest::create(['volume_id' => $volume->id, 'filename' => 'b.jpg']);
        $sequence = SequenceTest::make(['volume_id' => $volume->id]);
        $sequence->color = 'bada55';
        $sequence->save();

        $mock = Mockery::mock(Sort::class);
        $mock->shouldReceive('execute')
            ->once()
            ->andReturn([2, 1]);

        App::singleton(Sort::class, function () use ($mock) {
            return $mock;
        });

        $this->assertNull($sequence->sequence);
        with(new ComputeNewSequence($sequence))->handle();
        $this->assertEquals([2, 1], $sequence->sequence);
    }

    public function testHandleFailure()
    {
        $volume = VolumeTest::create(['url' => '/vol/images']);
        ImageTest::create(['volume_id' => $volume->id, 'filename' => 'a.jpg']);
        ImageTest::create(['volume_id' => $volume->id, 'filename' => 'b.jpg']);
        $sequence = SequenceTest::make(['volume_id' => $volume->id]);
        $sequence->color = 'bada55';
        $sequence->save();

        with(new ComputeNewSequence($sequence))->failed();
        $this->assertNull($sequence->fresh());
    }
}
