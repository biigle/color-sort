<?php

$router->group([
    'namespace' => 'Api',
    'prefix' => 'api/v1',
    'middleware' => 'auth.api',
    ], function ($router) {
        $router->resource('volumes.color-sort-sequence', 'VolumeColorSortSequenceController', [
            'only' => ['index', 'show', 'store', 'destroy'],
            'parameters' => ['volumes' => 'id'],
        ]);
    });
