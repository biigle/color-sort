<?php

Route::group([
    'prefix' => 'api/v1',
    'namespace' => '\Dias\Modules\Copria\ColorSort\Http\Controllers\Api',
    'middleware' => 'auth.api',
    ], function ($router) {
    $router->resource('transects.color-sort-sequence', 'TransectColorSortSequenceController', [
        'only' => ['index', 'show', 'store']
    ]);
});
