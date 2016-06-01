# Installation

Add this to your `composer.json` repositories array:
```json
{
    "type": "vcs",
    "url": "git@github.com:BiodataMiningGroup/dias-copria-color-sort.git"
}
```

Run `php composer.phar require dias/copria-color-sort:dev-master`.

To activate the module, add `'Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider'` to the providers array of `config/app.php`. Then run `php artisan copria-color-sort:install` to publish and run the migration.

# Configuration

If you want to edit any config values, run `php artisan vendor:publish --provider="Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider" --tag="config"` and edit `config/copria_color_sort.php`.

# Updating

Update the package using Composer. Then run `php artisan copria-color-sort:publish` to refresh the public assets.

# Removing

To remove the module, roll back the migration and run and `php composer.phar remove dias/copria-color-sort`. Then remove `'Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider'` from the providers array of `config/app.php`.

See [here](http://stackoverflow.com/a/30288058/1796523) for how to roll back a single migration (tl;dr: Find the migration in the `migrations` DB table, set it's batch number to the next highest number of all batch numbers, then run `php artisan migrate:rollback`).
