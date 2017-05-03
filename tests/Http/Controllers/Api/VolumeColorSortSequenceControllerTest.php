<?php

namespace Biigle\Tests\Modules\CopriaColorSort\Http\Controllers\Api;

use ApiTestCase;
use Biigle\Tests\ImageTest;
use Biigle\Modules\Copria\ColorSort\Volume;
use Biigle\Modules\Copria\ColorSort\Sequence;
use Biigle\Tests\Modules\CopriaColorSort\SequenceTest;
use Biigle\Modules\Copria\ColorSort\Jobs\ComputeNewSequence;

class VolumeColorSortSequenceControllerTest extends ApiTestCase
{
    public function testIndex()
    {
        $volume = $this->volume();
        $id = $volume->id;

        $s1 = SequenceTest::make(['volume_id' => $volume->id]);
        $s1->sequence = [1, 2];
        $s1->save();
        $s2 = SequenceTest::create(['volume_id' => $volume->id]);

        $this->doTestApiRoute('GET', "/api/v1/volumes/{$id}/color-sort-sequence");

        $this->beUser();
        $this->get("/api/v1/volumes/{$id}/color-sort-sequence")
            ->assertResponseStatus(403);

        $this->beGuest();
        $this->get("/api/v1/volumes/{$id}/color-sort-sequence")
            // show only sequences with actual sorting data
            ->seeJsonEquals([$s1->color]);
    }

    public function testShow()
    {
        $volume = $this->volume();
        $id = $volume->id;

        $s = SequenceTest::create(['volume_id' => $volume->id]);

        $this->doTestApiRoute('GET', "/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");

        $this->beUser();
        $this->get("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}")
            ->assertResponseStatus(403);

        $this->beGuest();
        $this->get("/api/v1/volumes/{$id}/color-sort-sequence/abc")
            ->assertResponseStatus(404);

        $this->get("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");
        // exists but computing is not finished yet
        $this->assertEmpty($this->response->getContent());

        $s->sequence = [1, 3, 2];
        $s->save();

        $this->get("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}")
            ->seeJsonEquals([1, 3, 2]);
    }

    public function testStore()
    {
        $volume = Volume::find($this->volume()->id);
        $id = $volume->id;

        $this->doTestApiRoute('POST', "/api/v1/volumes/{$id}/color-sort-sequence");

        // guests cannot request new color sort sequences
        $this->beGuest();
        $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'abcdef',
        ]);
        $this->assertResponseStatus(403);

        $this->beEditor();
        // missing color
        $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence");
        $this->assertResponseStatus(422);

        // invalid color
        $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bcdefg',
        ]);
        $this->assertResponseStatus(422);
        $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'abcdef1',
        ]);
        $this->assertResponseStatus(422);

        $this->expectsJobs(ComputeNewSequence::class);

        $this->assertEquals(0, $volume->colorSortSequences()->count());
        $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ])->assertResponseOk();
        $this->assertEquals(1, $volume->colorSortSequences()->count());
        $this->assertEquals('bada55', $volume->colorSortSequences()->first()->color);

        // requesting the same color twice is not allowed
        $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ])->assertResponseStatus(422);
    }

    public function testStoreRemote()
    {
        $volume = Volume::find($this->volume()->id);
        $id = $volume->id;
        $volume->url = 'http://localhost';
        $volume->save();

        $this->beEditor();
        $this->doesntExpectJobs(ComputeNewSequence::class);

        $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ]);
        $this->assertResponseStatus(422);
    }

    public function testDestroy()
    {
        $volume = $this->volume();
        $id = $volume->id;
        $s = SequenceTest::create(['volume_id' => $volume->id]);

        $this->doTestApiRoute('DELETE', "/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");

        $this->beEditor();
        $this->delete("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}")
            ->assertResponseStatus(403);

        $this->beAdmin();
        $this->delete("/api/v1/volumes/{$id}/color-sort-sequence/abc")
            ->assertResponseStatus(404);

        $this->assertNotNull($s->fresh());
        $this->delete("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");
        $this->assertResponseOk();
        $this->assertNull($s->fresh());
    }
}