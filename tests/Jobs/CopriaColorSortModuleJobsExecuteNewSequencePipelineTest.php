<?php

use Dias\Modules\Copria\User;
use Dias\Modules\Copria\ColorSort\Jobs\ExecuteNewSequencePipeline;

class CopriaColorSortModuleJobsExecuteNewSequencePipelineTest extends TestCase
{
    public function setUp()
    {
        parent::setUp();
        AttributeTest::create(['name' => 'copria_api_key', 'type' => 'string']);
        Artisan::call('copria-color-sort:install');

        if (DB::connection() instanceof Illuminate\Database\SQLiteConnection) {
            // ignore reconnect because sqlite DB would be dumped
            DB::shouldReceive('reconnect')->once();
            // add this, otherwise disconnect of TestCase would fail
            DB::shouldReceive('disconnect')->once();
        }
    }

    public function tearDown()
    {
        if (!(DB::connection() instanceof Illuminate\Database\SQLiteConnection)) {
            Artisan::call('copria-color-sort:uninstall');
        }
        parent::tearDown();
    }

    public function testHandle()
    {
        $transect = TransectTest::create(['url' => '/vol/images']);
        ImageTest::create(['transect_id' => $transect->id, 'filename' => 'a.jpg']);
        ImageTest::create(['transect_id' => $transect->id, 'filename' => 'b.jpg']);
        $sequence = CopriaColorSortModuleSequenceTest::make(['transect_id' => $transect->id]);
        $sequence->color = 'bada55';
        $sequence->generateToken();
        $sequence->save();

        User::convert($transect->creator)->copria_api_key = 'abcd';

        $url = "http://localhost:8000/api/v1/copria-color-sort-result/{$sequence->token}";

        Copria::shouldReceive('userExecutePipeline')->once()
            ->with(config('copria_color_sort.pipeline_id'), 'abcd', $url, [
                config('copria_color_sort.hex_color_selector') => 'bada55',
                config('copria_color_sort.images_directory_selector') => '/vol/images',
                config('copria_color_sort.images_filenames_selector') => 'a.jpg,b.jpg',
                config('copria_color_sort.images_ids_selector') => '1,2',
                config('copria_color_sort.target_url_selector') => $url,
            ]);

        // queue is synchronous in test environment and processes immediately
        Queue::push(new ExecuteNewSequencePipeline($sequence, $transect->creator));
    }
}
