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

color = np.array(hex_to_rgb(js['color'])).reshape(1, -1)
files = np.array(js['files'])
ids = np.array(js['ids'])

mdists = []
for path in files:
    img = imread(path)
    mdists.append(np.mean(scipy.spatial.distance.cdist(color, img.reshape(-1, 3))))
idxs = np.argsort(mdists)

print json.dumps(ids[idxs].tolist())
