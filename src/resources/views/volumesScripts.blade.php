@if ($volume->isImageVolume())
    {{vite_hot(base_path('vendor/biigle/color-sort/hot'), ['src/resources/assets/js/main.js'], 'vendor/color-sort')}}
    <script type="module">
        biigle.$declare('volumes.canEdit', @can('edit-in', $volume) true @else false @endcan);
    </script>
@endif
