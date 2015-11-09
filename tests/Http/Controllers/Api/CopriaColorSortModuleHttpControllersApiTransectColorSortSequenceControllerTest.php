<?php

use Dias\Modules\Copria\ColorSort\Transect;
use Dias\Modules\Copria\ColorSort\Sequence;

class CopriaColorSortModuleHttpControllersApiTransectColorSortSequenceControllerTest extends ApiTestCase {

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

    public function testIndex()
    {
        $transect = TransectTest::create();
        $id = $transect->id;
        $this->project->addTransectId($id);

        $s = CopriaColorSortModuleSequenceTest::create(['transect_id' => $transect->id]);

        $this->doTestApiRoute('GET', "/api/v1/transects/{$id}/color-sort-sequence");

        $this->be($this->user);
        $this->get("/api/v1/transects/{$id}/color-sort-sequence")
            ->assertResponseStatus(401);

        $this->be($this->guest);
        $this->get("/api/v1/transects/{$id}/color-sort-sequence")
            ->seeJsonEquals([$s->color]);
    }

    public function testShow()
    {
        $transect = TransectTest::create();
        $id = $transect->id;
        $this->project->addTransectId($id);

        $s = CopriaColorSortModuleSequenceTest::create(['transect_id' => $transect->id]);

        $this->doTestApiRoute('GET', "/api/v1/transects/{$id}/color-sort-sequence/{$s->color}");

        $this->be($this->user);
        $this->get("/api/v1/transects/{$id}/color-sort-sequence/{$s->color}")
            ->assertResponseStatus(401);

        $this->be($this->guest);
        $this->get("/api/v1/transects/{$id}/color-sort-sequence/abc")
            ->assertResponseStatus(404);

        $this->get("/api/v1/transects/{$id}/color-sort-sequence/{$s->color}");
        // exists but computing is not finished yet
        $this->assertEmpty($this->response->getContent());

        $s->sequence = [1, 3, 2];
        $s->save();

        $this->get("/api/v1/transects/{$id}/color-sort-sequence/{$s->color}")
            ->seeJsonEquals([1, 3, 2]);
    }

    public function testStore()
    {
        // don't submit an actual Copria job here
        Sequence::flushEventListeners();
        AttributeTest::create(['name' => 'copria_api_key', 'type' => 'string']);

        $transect = Transect::find(TransectTest::create()->id);
        $id = $transect->id;
        $this->project->addTransectId($id);

        $this->doTestApiRoute('POST', "/api/v1/transects/{$id}/color-sort-sequence");

        // guests cannot request new color sort sequences
        $this->be($this->guest);
        $this->guest->attachDiasAttribute('copria_api_key', 'abcd');
        $this->callAjax('POST', "/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
            'color' => 'abcdef',
        ]);
        $this->assertResponseStatus(401);

        $this->be($this->editor);

        $this->callAjax('POST', "/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
            'color' => 'c0ffee',
        ]);
        // user has no Copria account connected
        $this->assertResponseStatus(401);
        $this->editor->attachDiasAttribute('copria_api_key', 'abcd');

        // missing color
        $this->callAjax('POST', "/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
        ]);
        $this->assertResponseStatus(422);

        // invalid color
        $this->callAjax('POST', "/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
            'color' => 'bcdefg',
        ]);
        $this->assertResponseStatus(422);
        $this->callAjax('POST', "/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
            'color' => 'abcdef1',
        ]);
        $this->assertResponseStatus(422);

        $this->assertEquals(0, $transect->colorSortSequences()->count());
        $this->post("/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
            'color' => 'bada55',
        ])->assertResponseOk();
        $this->assertEquals(1, $transect->colorSortSequences()->count());
        $this->assertEquals('bada55', $transect->colorSortSequences()->first()->color);

        // requesting the same color twice is not allowed
        $this->post("/api/v1/transects/{$id}/color-sort-sequence", [
            '_token' => Session::token(),
            'color' => 'bada55',
        ])->assertResponseStatus(405);
    }
}
