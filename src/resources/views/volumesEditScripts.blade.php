@if ($volume->isImageVolume())
    <script src="{{ cachebust_asset('vendor/color-sort/scripts/volumes.js') }}"></script>
    <script type="text/javascript">
        biigle.$declare('volumes.colorSortSequences', {!! \Biigle\Modules\ColorSort\Sequence::where('volume_id', $volume->id)->pluck('color') !!});
    </script>
@endif
