<?php

namespace Biigle\Modules\Copria\ColorSort\Support;

use Log;
use File;
use Exception;
use Biigle\Volume;

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
        $file = tempnam(sys_get_temp_dir(), 'biigle_color_sort');
        File::put($file, json_encode([
            'color' => $color,
            'base' => public_path(config('thumbnails.uri')),
            'format' => config('thumbnails.format'),
            'files' => $images->values(),
            'ids' => $images->keys(),
        ]));

        $code = 0;
        $python = config('copria_color_sort.python');
        $script = config('copria_color_sort.script');
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
    }
}
