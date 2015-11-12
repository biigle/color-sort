# Installation

Add this to your `composer.json` repositories array:
```json
{
    "type": "vcs",
    "url": "porta.cebitec.uni-bielefeld.de:/vol/biodtmin/git/dias-copria-color-sort.git"
}
```

Run `php composer.phar require dias/copria-color-sort:dev-master`.

To activate the module, add `'Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider'` to the providers array of `config/app.php`. Then run `php artisan copria-color-sort:install` to publish and run the migration.

Finally add `'api/v1/copria-color-sort-result/*'` to the `$except` array of your `Dias\Http\Middleware\VerifyCsrfToken` middleware (see [Excluding URIs From CSRF Protection](http://laravel.com/docs/5.1/routing#csrf-protection)). This will except the single route from CRSF protection since the route authenticates using a token in the URL.

# Configuration

If you want to edit any config values, run `php artisan vendor:publish --provider="Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider" --tag="config"` and edit `config/copria_color_sort.php`.

# Updating

Update the package using Composer. Then run `php artisan copria-color-sort:publish` to refresh the public assets.

# Removing

To remove the module, roll back the migration and run and `php composer.phar remove dias/copria-color-sort`. Then remove `'Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider'` from the providers array of `config/app.php`
