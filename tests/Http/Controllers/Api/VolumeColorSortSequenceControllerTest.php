<?php

namespace Biigle\Tests\Modules\ColorSort\Http\Controllers\Api;

use ApiTestCase;
use Biigle\MediaType;
use Biigle\Modules\ColorSort\Jobs\ComputeNewSequence;
use Biigle\Modules\ColorSort\Sequence;
use Biigle\Tests\Modules\ColorSort\SequenceTest;

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
        $response = $this->get("/api/v1/volumes/{$id}/color-sort-sequence")
            ->assertStatus(403);

        $this->beGuest();
        $response = $this->get("/api/v1/volumes/{$id}/color-sort-sequence")
            // show only sequences with actual sorting data
            ->assertExactJson([$s1->color]);
    }

    public function testIndexVideoVolume()
    {
        $volume = $this->volume(['media_type_id' => MediaType::videoId()]);
        $id = $volume->id;

        $this->beGuest();
        $this->get("/api/v1/volumes/{$id}/color-sort-sequence")->assertStatus(404);
    }

    public function testShow()
    {
        $volume = $this->volume();
        $id = $volume->id;

        $s = SequenceTest::create(['volume_id' => $volume->id]);

        $this->doTestApiRoute('GET', "/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");

        $this->beUser();
        $response = $this->get("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}")
            ->assertStatus(403);

        $this->beGuest();
        $response = $this->get("/api/v1/volumes/{$id}/color-sort-sequence/abc")
            ->assertStatus(404);

        $response = $this->get("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");
        // exists but computing is not finished yet
        $this->assertEmpty($response->getContent());

        $s->sequence = [1, 3, 2];
        $s->save();

        $response = $this->get("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}")
            ->assertExactJson([1, 3, 2]);
    }

    public function testStore()
    {
        $id = $this->volume()->id;

        $this->doTestApiRoute('POST', "/api/v1/volumes/{$id}/color-sort-sequence");

        // guests cannot request new color sort sequences
        $this->beGuest();
        $response = $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'abcdef',
        ]);
        $response->assertStatus(403);

        $this->beEditor();
        // missing color
        $response = $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence");
        $response->assertStatus(422);

        // invalid color
        $response = $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bcdefg',
        ]);
        $response->assertStatus(422);
        $response = $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'abcdef1',
        ]);
        $response->assertStatus(422);

        $this->expectsJobs(ComputeNewSequence::class);

        $this->assertEquals(0, Sequence::where('volume_id', $id)->count());
        $response = $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ])->assertSuccessful();
        $this->assertEquals(1, Sequence::where('volume_id', $id)->count());
        $this->assertEquals('bada55', Sequence::where('volume_id', $id)->first()->color);
        $this->assertEquals('high', $this->dispatchedJobs[0]->queue);

        // requesting the same color twice is not allowed
        $response = $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ])->assertStatus(422);
    }

    public function testStoreRemote()
    {
        // In an older version color sorting was disabled for remote volumes. But now
        // it works here, too.
        $volume = $this->volume();
        $volume->url = 'http://localhost';
        $volume->save();
        $id = $volume->id;

        $this->beEditor();
        $this->expectsJobs(ComputeNewSequence::class);

        $response = $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ]);
        $response->assertSuccessful();
    }

    public function testStoreVideoVolume()
    {
        $volume = $this->volume(['media_type_id' => MediaType::videoId()]);
        $id = $volume->id;

        $this->beEditor();
        $this->postJson("/api/v1/volumes/{$id}/color-sort-sequence", [
                'color' => 'bada55',
            ])
            ->assertStatus(422);
    }

    public function testDestroy()
    {
        $id = $this->volume()->id;
        $s = SequenceTest::create(['volume_id' => $id]);

        $this->doTestApiRoute('DELETE', "/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");

        $this->beEditor();
        $response = $this->delete("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}")
            ->assertStatus(403);

        $this->beAdmin();
        $response = $this->delete("/api/v1/volumes/{$id}/color-sort-sequence/abc")
            ->assertStatus(404);

        $this->assertNotNull($s->fresh());
        $response = $this->delete("/api/v1/volumes/{$id}/color-sort-sequence/{$s->color}");
        $response->assertStatus(200);
        $this->assertNull($s->fresh());
    }
}
