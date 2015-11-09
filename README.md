# Installation

Add this to your `composer.json` repositories array:
```json
{
    "type": "vcs",
    "url": "porta.cebitec.uni-bielefeld.de:/vol/biodtmin/git/dias-copria-color-sort.git"
}
```

Run `php composer.phar require dias/copria-color-sort:dev-master`.

To activate the module, add `'Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider'` to the providers array of `config/app.php`. Then run `php artisan copria-color-sort:install`.

# Configuration

Use `php artisan copria-color-sort:clear` to remove the color sort data for all transects.

If you want to edit any config values, run `php artisan vendor:publish --provider="Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider" --tag="config"` and edit `config/copria_color_sort.php`.

# Removing

To remove the module, run `php artisan copria-color-sort:uninstall` and `php composer.phar remove dias/copria-color-sort`. Then remove `'Dias\Modules\Copria\ColorSort\CopriaColorSortServiceProvider'` from the providers array of `config/app.php`
