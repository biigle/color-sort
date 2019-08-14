# BIIGLE ColorSort Module

This is the BIIGLE module to create, edit and explore image color-sort.

## Installation

1. Run `composer config repositories.color-sort vcs git@github.com:biigle/color-sort.git`
2. Run `composer require biigle/color-sort`.
3. Add `Biigle\Modules\ColorSort\ColorSortServiceProvider::class` to the `providers` array in `config/app.php`.
4. Run `docker-compose exec app php artisan migrate` to create the new database tables.
4. Run `php artisan vendor:publish --tag=public` to publish the public assets of this module.
5. Run `pip install -r vendor/biigle/color-sort/requirements.txt` to install the Python requirements.

## Developing

Take a look at the [development guide](https://github.com/biigle/core/blob/master/DEVELOPING.md) of the core repository to get started with the development setup.

Want to develop a new module? Head over to the [biigle/module](https://github.com/biigle/module) template repository.

## Contributions and bug reports

Contributions to BIIGLE are always welcome. Check out the [contribution guide](https://github.com/biigle/core/blob/master/CONTRIBUTING.md) to get started.
