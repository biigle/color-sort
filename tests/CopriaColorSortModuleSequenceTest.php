<?php

use Dias\Modules\Copria\ColorSort\Sequence;

class CopriaColorSortModuleSequenceTest extends TestCase {

    public static function make($params = [])
    {
        $s = new Sequence;
        $s->transect_id = isset($params['transect_id']) ? $params['transect_id'] : TransectTest::create()->id;
        $s->color = str_random(6);

        return $s;
    }

    public static function create($params = [])
    {
        $s = static::make($params);
        $s->save();

        return $s;
    }

    public function setUp()
    {
        parent::setUp();
        Artisan::call('copria-color-sort:install');
    }

    public function tearDown()
    {
        Artisan::call('copria-color-sort:uninstall');
        parent::tearDown();
    }

    public function testTransectOnDeleteCascade()
    {
        $s = static::create();
        $s->transect()->delete();
        $this->assertNull($s->fresh());
    }

    public function testGenerateToken()
    {
        $s = static::make();
        $this->assertNull($s->token);
        $s->generateToken();
        $this->assertNotNull($s->token);
    }

    public function testCastSequence()
    {
        $s = static::make();
        $s->sequence = [1, 2, 3];
        $s->save();
        $this->assertEquals([1, 2, 3], $s->fresh()->sequence);
    }
}
