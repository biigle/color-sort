# BIIGLE ColorSort Module

[![Test status](https://github.com/biigle/color-sort/workflows/Tests/badge.svg)](https://github.com/biigle/color-sort/actions?query=workflow%3ATests)

This is the BIIGLE module to sort volume images by color.

## Installation

1. Run `composer require biigle/color-sort`.
2. Add `Biigle\Modules\ColorSort\ColorSortServiceProvider::class` to the `providers` array in `config/app.php`.
3. Run `docker-compose exec app php artisan migrate` to create the new database tables.
4. Run `php artisan vendor:publish --tag=public` to publish the public assets of this module.
5. Run `pip install -r vendor/biigle/color-sort/requirements.txt` to install the Python requirements.

## Developing

Take a look at the [development guide](https://github.com/biigle/core/blob/master/DEVELOPING.md) of the core repository to get started with the development setup.

Want to develop a new module? Head over to the [biigle/module](https://github.com/biigle/module) template repository.

## Contributions and bug reports

Contributions to BIIGLE are always welcome. Check out the [contribution guide](https://github.com/biigle/core/blob/master/CONTRIBUTING.md) to get started.
