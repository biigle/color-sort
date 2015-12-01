<?php

Route::group([
    'namespace' => '\Dias\Modules\Copria\ColorSort\Http\Controllers\Api',
    'prefix' => 'api/v1',
    'middleware' => 'auth.api',
    ], function ($router) {

        $router->resource('transects.color-sort-sequence', 'TransectColorSortSequenceController', [
            'only' => ['index', 'show', 'store']
        ]);
});
