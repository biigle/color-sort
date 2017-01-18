<?php

namespace Biigle\Tests\Modules\CopriaColorSort;

use TestCase;

class ConfigTest extends TestCase
{
    public function testConfig()
    {
        $this->assertNotNull(config('copria_color_sort.pipeline_id'));
    }
}
