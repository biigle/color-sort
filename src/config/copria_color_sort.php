<?php

return [

    /*
    | ID of the Copria pipeline for sorting images by color.
    */
    'pipeline_id' => 89,

    /*
    | Selector for the dynamic parameter of the hex color
    */
    'hex_color_selector' => '2.0.value',

    /*
    | Selector for the dynamic parameter of the directory of the images
    */
    'images_directory_selector' => '0.0.value',

    /*
    | Selector for the dynamic parameter of the joined images filenames string
    */
    'images_filenames_selector' => '1.0.value',

    /*
    | Selector for the dynamic parameter of the joined images IDs
    */
    'images_ids_selector' => '3.0.value',

    /*
    | Selector for the dynamic parameter of the response target URL
    */
    'target_url_selector' => '7.0.value',

];
