@if ($volume->isImageVolume())
    {{vite_hot(base_path('vendor/biigle/color-sort/hot'), ['src/resources/assets/sass/main.scss'], 'vendor/color-sort')}}
@endif
