@if ($volume->isImageVolume())
    {{vite_hot(base_path('vendor/biigle/color-sort/hot'), ['src/resources/assets/js/main.js'], 'vendor/color-sort')}}
    <script type="module">
        biigle.$declare('volumes.colorSortSequences', {!! \Biigle\Modules\ColorSort\Sequence::where('volume_id', $volume->id)->pluck('color') !!});
    </script>
@endif
