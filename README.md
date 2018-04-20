# Installation

Add this to your `composer.json` repositories array:
```json
{
    "type": "vcs",
    "url": "git@github.com:BiodataMiningGroup/biigle-color-sort.git"
}
```

Run `php composer.phar require biigle/color-sort`.

Run `pip install -r vendor/biigle/color-sort/requirements.txt` to install Python requirements.

To activate the module, add `'Biigle\Modules\ColorSort\ColorSortServiceProvider'` to the providers array of `config/app.php`. Then run `php artisan color-sort:install` to publish and run the migration.

# Configuration

If you want to edit any config values, run `php artisan vendor:publish --provider="Biigle\Modules\ColorSort\ColorSortServiceProvider" --tag="config"` and edit `config/color_sort.php`.

# Updating

Update the package using Composer. Then run `php artisan color-sort:publish` to refresh the public assets.

# Removing

To remove the module, roll back the migration and run and `php composer.phar remove biigle/color-sort`. Then remove `'Biigle\Modules\ColorSort\ColorSortServiceProvider'` from the providers array of `config/app.php`.

See [here](http://stackoverflow.com/a/30288058/1796523) for how to roll back a single migration (tl;dr: Find the migration in the `migrations` DB table, set it's batch number to the next highest number of all batch numbers, then run `php artisan migrate:rollback`).
