<?php

class CopriaColorSortModuleConfigTest extends TestCase {

   public function testConfig()
   {
      $this->assertNotNull(config('copria_color_sort.pipeline_id'));
   }
}
