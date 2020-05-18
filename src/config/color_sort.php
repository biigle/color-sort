<?php

return [

    /*
    | Path to the Python executable.
    */
    'python' => '/usr/bin/python3',

    /*
    | Path to the sorting script.
    */
    'script' => __DIR__.'/../resources/scripts/sort.py',

    /*
     | Specifies which queue should be used for which job.
     */
    'compute_new_sequence_queue' => env('COLOR_SORT_COMPUTE_NEW_SEQUENCE_QUEUE', 'high'),

];
