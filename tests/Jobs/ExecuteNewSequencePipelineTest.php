<?php

namespace Biigle\Tests\Modules\CopriaColorSort\Jobs;

use Copria;
use Mockery;
use TestCase;
use Exception;
use Biigle\Tests\ImageTest;
use Biigle\Tests\VolumeTest;
use Biigle\Modules\Copria\ApiToken;
use Biigle\Modules\Copria\PipelineCallback;
use Biigle\Tests\Modules\CopriaColorSort\SequenceTest;
use Biigle\Modules\Copria\ColorSort\Jobs\ExecuteNewSequencePipeline;

class ExecuteNewSequencePipelineTest extends TestCase
{

    public function testHandle()
    {
        $volume = VolumeTest::create(['url' => '/vol/images']);
        $volume->createImages(['a.jpg', 'b.jpg']);
        $sequence = SequenceTest::make(['volume_id' => $volume->id]);
        $sequence->color = 'bada55';
        $sequence->save();

        $token = new ApiToken;
        $token->owner()->associate($volume->creator);
        $token->token = 'abcd';
        $token->save();

        // this should work even if the application is located in a subdiectory!
        config(['app.url' => 'http://localhost:8000/sub']);

        $urlMatcher = Mockery::on(function ($arg) {
            return preg_match('/^http:\/\/localhost:8000\/sub\/api\/v1\/copria-pipeline-callback\/.+$/', $arg) === 1;
        });

        $paramsMatcher = Mockery::on(function ($arg) use ($urlMatcher) {
            $valid = 1;
            $valid &= $arg[config('copria_color_sort.hex_color_selector')] === 'bada55';
            $valid &= $arg[config('copria_color_sort.images_directory_selector')] === '/vol/images';
            $valid &= $arg[config('copria_color_sort.images_filenames_selector')] === 'a.jpg,b.jpg';
            $valid &= $arg[config('copria_color_sort.images_ids_selector')] === '1,2';
            $valid &= $urlMatcher->match($arg[config('copria_color_sort.target_url_selector')]);
            return $valid === 1;
        });

        Copria::shouldReceive('userExecutePipeline')->once()
            ->with(config('copria_color_sort.pipeline_id'), 'abcd', $urlMatcher, $paramsMatcher);

        $this->assertEquals(0, PipelineCallback::count());
        with(new ExecuteNewSequencePipeline($sequence, $volume->creator))->handle();
        $this->assertEquals(1, PipelineCallback::count());
    }

    public function testHandleFailure()
    {
        $volume = VolumeTest::create(['url' => '/vol/images']);
        ImageTest::create(['volume_id' => $volume->id, 'filename' => 'a.jpg']);
        ImageTest::create(['volume_id' => $volume->id, 'filename' => 'b.jpg']);
        $sequence = SequenceTest::make(['volume_id' => $volume->id]);
        $sequence->color = 'bada55';
        $sequence->save();

        $token = new ApiToken;
        $token->owner()->associate($volume->creator);
        $token->token = 'abcd';
        $token->save();

        Copria::shouldReceive('userExecutePipeline')->andThrow('Exception');

        try {
            with(new ExecuteNewSequencePipeline($sequence, $volume->creator))->handle();
            $this->assertFalse(true);
        } catch (Exception $e) {
            // don't create the callback if anything went wrong
            $this->assertEquals(0, PipelineCallback::count());
        }
    }
}
