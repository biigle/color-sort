"use strict";
process.env.DISABLE_NOTIFIER = true;

var gulp    = require('gulp');
var elixir  = require('laravel-elixir');
var angular = require('laravel-elixir-angular');
var shell   = require('gulp-shell');

elixir(function (mix) {
    process.chdir('src');
    mix.sass('transects.scss', 'public/assets/styles/transects.css')
    mix.angular('resources/assets/js/transects/', 'public/assets/scripts', 'transects.js');
    mix.task('publish', 'public/assets/**/*');
});

gulp.task('publish', function () {
    gulp.src('').pipe(shell('php ../../../../artisan vendor:publish --provider="Biigle\\Modules\\Copria\\ColorSort\\CopriaColorSortServiceProvider" --tag="public" --force'));
});
