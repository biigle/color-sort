<?php

namespace Biigle\Tests\Modules\CopriaColorSort\Http\Controllers\Api;

use ApiTestCase;
use Biigle\Tests\ImageTest;
use Biigle\Modules\Copria\ApiToken;
use Biigle\Modules\Copria\PipelineCallback;
use Biigle\Modules\Copria\ColorSort\Volume;
use Biigle\Modules\Copria\ColorSort\Sequence;
use Biigle\Tests\Modules\CopriaColorSort\SequenceTest;
use Biigle\Modules\Copria\ColorSort\Jobs\ExecuteNewSequencePipeline;

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
        $token = new ApiToken;
        $token->owner()->associate($this->guest());
        $token->token = 'abcd';
        $token->save();
        $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'abcdef',
        ]);
        $this->assertResponseStatus(403);

        $this->beEditor();

        $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'c0ffee',
        ]);
        // user has no Copria account connected
        $this->assertResponseStatus(401);

        $token = new ApiToken;
        $token->owner()->associate($this->editor());
        $token->token = 'abcd';
        $token->save();

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

        $this->expectsJobs(ExecuteNewSequencePipeline::class);

        $this->assertEquals(0, $volume->colorSortSequences()->count());
        $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ])->assertResponseOk();
        $this->assertEquals(1, $volume->colorSortSequences()->count());
        $this->assertEquals('bada55', $volume->colorSortSequences()->first()->color);

        // requesting the same color twice is not allowed
        $this->post("/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ])->assertResponseStatus(405);
    }

    public function testStoreRemote()
    {
        $volume = Volume::find($this->volume()->id);
        $id = $volume->id;
        $volume->url = 'http://localhost';
        $volume->save();

        $this->beEditor();
        $token = new ApiToken;
        $token->owner()->associate($this->editor());
        $token->token = 'abcd';
        $token->save();

        $this->doesntExpectJobs(ExecuteNewSequencePipeline::class);

        $this->json('POST', "/api/v1/volumes/{$id}/color-sort-sequence", [
            'color' => 'bada55',
        ]);
        $this->assertResponseStatus(422);
    }

    public function testResultMalformed()
    {
        $sequence = SequenceTest::create();

        $callback = new PipelineCallback;
        $callback->generateToken();
        $callback->function = 'Biigle\Modules\Copria\ColorSort\Http\Controllers\Api\VolumeColorSortSequenceController@result';
        $callback->payload = ['id' => $sequence->id];
        $callback->save();

        // image ids are missing
        $this->post("api/v1/copria-pipeline-callback/{$callback->token}")
            ->assertResponseStatus(422);
    }

    public function testResultFailed()
    {
        $sequence = SequenceTest::create();

        $callback = new PipelineCallback;
        $callback->generateToken();
        $callback->function = 'Biigle\Modules\Copria\ColorSort\Http\Controllers\Api\VolumeColorSortSequenceController@result';
        $callback->payload = ['id' => $sequence->id];
        $callback->save();

        // job failed, delete color sort sequence
        $this->post("api/v1/copria-pipeline-callback/{$callback->token}", ['state' => []])
            ->assertResponseOk();
        $this->assertNull($sequence->fresh());
    }

    public function testResultSuccess()
    {
        $sequence = SequenceTest::create();

        $callback = new PipelineCallback;
        $callback->generateToken();
        $callback->function = 'Biigle\Modules\Copria\ColorSort\Http\Controllers\Api\VolumeColorSortSequenceController@result';
        $callback->payload = ['id' => $sequence->id];
        $callback->save();

        $image1 = ImageTest::create(['volume_id' => $sequence->volume->id, 'filename' => 'a']);
        $image2 = ImageTest::create(['volume_id' => $sequence->volume->id, 'filename' => 'b']);

        // job succeeded, set sorting order
        $this->post("api/v1/copria-pipeline-callback/{$callback->token}", ['pin1' => $image2->id.',300,200,'.$image1->id])
            ->assertResponseOk();
        // the sequence should only contain image IDs that actually belong to the volume
        // the ordering must be kept, though
        $this->assertEquals([$image2->id, $image1->id], $sequence->fresh()->sequence);
    }
}
