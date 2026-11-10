"""Expand a screen quad outward by a margin, through its perspective homography.
Usage: quad.py mx my x0 y0 x1 y1 x2 y2 x3 y3   (TL TR BL BR, source px)
Prints ffmpeg perspective args for the expanded quad, so that after warping the
screen sits in the middle with mx/my (fraction of screen size) of surroundings."""
import sys
import numpy as np
mx, my, *p = map(float, sys.argv[1:])
src = np.array([[0,0],[1,0],[0,1],[1,1]], float)
dst = np.array(p).reshape(4,2)
A=[]; b=[]
for (u,v),(x,y) in zip(src,dst):
    A.append([u,v,1,0,0,0,-u*x,-v*x]); b.append(x)
    A.append([0,0,0,u,v,1,-u*y,-v*y]); b.append(y)
h = np.linalg.solve(np.array(A), np.array(b)); H = np.append(h,1).reshape(3,3)
out=[]
for u,v in [(-mx,-my),(1+mx,-my),(-mx,1+my),(1+mx,1+my)]:
    x,y,w = H @ [u,v,1]; out += [round(x/w), round(y/w)]
print(":".join(map(str,out)))
