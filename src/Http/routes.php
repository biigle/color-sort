<?php

Route::group([
    'namespace' => '\Dias\Modules\Copria\ColorSort\Http\Controllers\Api',
    'prefix' => 'api/v1',
    ], function ($router) {

    $router->group(['middleware' => 'auth.api'], function ($router) {
        $router->resource('transects.color-sort-sequence', 'TransectColorSortSequenceController', [
            'only' => ['index', 'show', 'store']
        ]);
    });

    // this route is public so no secret API acces keys of users are exposed to Copria pipelines
    // the authentication is done using the token of the color sort sequences
    $router->post('copria-color-sort-result/{token}', [
        'as' => 'copria-color-sort-result',
        'uses' => 'TransectColorSortSequenceController@result'
    ]);
});
