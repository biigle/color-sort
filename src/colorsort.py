import numpy as np
from scipy.misc import imread
import scipy.spatial.distance
import sys
import json


def hex_to_rgb(value):
    value = value.lstrip('#')
    lv = len(value)
    return tuple(int(value[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))


f = open(sys.argv[1], 'r')
js = json.load(f)
f.close()

targetColor = np.array(hex_to_rgb(js['targetColor'])).reshape(1, -1)
imgs = np.array(js['files'])

mdists = []
for imgfile in imgs:
    img = imread(imgfile)
    mdists.append(np.mean(scipy.spatial.distance.cdist(targetColor, img.reshape(-1, 3))))
idxs = np.argsort(mdists)
print imgs[idxs]
