<?php

namespace Biigle\Modules\ColorSort\Support;

use Log;
use File;
use FileCache;
use Exception;
use Biigle\Volume;
use Biigle\FileCache\GenericFile;

/**
 * Wrapper for the color sort script.
 */
class Sort
{
    /**
     * Compute a color sort sequence.
     *
     * @param Volume $volume Volume to compute the color sort sequence for.
     * @param string $color Color to use for sorting (like `BADA55`).
     * @throws Exception If the script crashed.
     *
     * @return array Sorted image IDs.
     */
    public function execute(Volume $volume, $color)
    {
        $images = $volume->images()->pluck('uuid', 'id');
        $disk = config('thumbnails.storage_disk');
        $format = config('thumbnails.format');
        $thumbs = $images->map(function ($uuid) use ($disk, $format) {
                $path = fragment_uuid_path($uuid);
                return new GenericFile("{$disk}://{$path}.{$format}");
            })
            ->values()
            ->toArray();

        $callback = function ($files, $paths) use ($images, $color) {
            $file = tempnam(sys_get_temp_dir(), 'biigle_color_sort');
            File::put($file, json_encode([
                'color' => $color,
                'files' => $paths,
                'ids' => $images->keys(),
            ]));

            $code = 0;
            $python = config('color_sort.python');
            $script = config('color_sort.script');
            $lines = [];
            $command = "{$python} {$script} \"{$file}\" 2>&1";

            try {
                $output = json_decode(exec($command, $lines, $code), true);
            } finally {
                File::delete($file);
            }

            if ($code !== 0 || $output === null) {
                $message = "Fatal error with color sort script (code {$code}).";
                Log::error($message, [
                    'command' => $command,
                    'output' => $lines,
                ]);

                throw new Exception($message);
            }

            return $output;
        };

        return FileCache::batchOnce($thumbs, $callback);
    }
}
