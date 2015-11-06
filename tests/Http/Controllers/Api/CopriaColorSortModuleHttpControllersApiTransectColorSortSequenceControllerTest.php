<?php

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
}
