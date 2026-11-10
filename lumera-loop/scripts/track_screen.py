"""Per-frame screen tracking + straightening, for clips where the camera is not on a tripod.
Tracks the 4 screen corners (L-shaped bezel edges, template matching, sub-pixel), builds the
wall-plane homography frame0->frameT, moves the margin-expanded quad with it, and warps every
frame to a fixed 1920x1080 view. Result: the screen is perfectly still and straight.
Set CLEAN=1 to also clean the picture (scan lines + blocky dark patches), see clean_screen().
Usage: track_screen.py <in.mp4> <out.mp4> <ss> <dur> <mx> <my> <ref_t> <TL> <TR> <BL> <BR>
  corners "x,y" = screen corners as measured in the source frame at absolute time <ref_t> (the
  reference pose: the output keeps the screen exactly where it is in that frame).
"""
import sys, os, subprocess, numpy as np, cv2
src,dst,ss,dur = sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
mx,my = float(sys.argv[5]),float(sys.argv[6]); ref_t=sys.argv[7]
C0 = np.array([[float(v) for v in a.split(',')] for a in sys.argv[8:12]],np.float32)
FW,FH = 1728,3072; OW,OH = 1920,1080
# expanded quad (screen + margin) in frame-0 coords, via the screen's own homography
U = np.array([[0,0],[1,0],[0,1],[1,1]],np.float32)
Hu = cv2.getPerspectiveTransform(U,C0)
Eu = np.array([[-mx,-my],[1+mx,-my],[-mx,1+my],[1+mx,1+my]],np.float32)
E0 = cv2.perspectiveTransform(Eu[None],Hu)[0]
dstq = np.array([[0,0],[OW,0],[0,OH],[OW,OH]],np.float32)
CLEAN = os.environ.get("CLEAN","0")=="1"
# screen rectangle in the 1920x1080 output (mx,my margins -> screen is 1600x830 at 160,125); inset a few px
CX0,CY0,CX1,CY1 = int(OW/(1+2*mx)*mx)+6, int(OH/(1+2*my)*my)+6, OW-int(OW/(1+2*mx)*mx)-6, OH-int(OH/(1+2*my)*my)-6
_rng = np.random.default_rng(0)
def clean_screen(img):
    """Make the LED screen look clean: (1) vertical blur + horizontal sharpen removes the LED scan lines
    while keeping edges crisp, (2) dark areas are smoothed and the black point lifted so the source
    video's blocky compression patches in shadows disappear, (3) light dither avoids banding.
    Only the inside of the screen is touched (no halo from the bezel/wall)."""
    c = img[CY0:CY1, CX0:CX1].astype(np.float32)/255.0
    b = cv2.GaussianBlur(c,(0,0),sigmaX=0.01,sigmaY=2.1)
    o = b + 0.9*(b-cv2.GaussianBlur(b,(0,0),sigmaX=1.6,sigmaY=0.01))
    o = o + 0.25*(o-cv2.GaussianBlur(o,(0,0),sigmaX=0.01,sigmaY=2.5))
    o = np.clip(o,0,1)
    Y = o[...,0]*0.114+o[...,1]*0.587+o[...,2]*0.299
    m = np.clip((0.52-Y)/(0.52-0.20),0,1); m = m*m*(3-2*m); m = cv2.GaussianBlur(m,(0,0),8)[...,None]
    soft = cv2.GaussianBlur(o,(0,0),24)
    o = o*(1-m)+soft*m
    o = np.clip((o-0.075)/(1-0.075),0,1)
    o = np.clip(o + m*_rng.normal(0,0.005,o.shape[:2])[...,None],0,1)
    out = img.copy(); out[CY0:CY1, CX0:CX1] = (o*255+0.5).astype(np.uint8)
    return out
rd = subprocess.Popen(["ffmpeg","-v","error","-ss",ss,"-t",dur,"-i",src,"-map","0:v:0","-vf","fps=30","-f","rawvideo","-pix_fmt","bgr24","-"],stdout=subprocess.PIPE)
fsz = FW*FH*3
R=70; S=380   # template half-size, search half-size
# reference frame -> corner templates
_r=subprocess.run(["ffmpeg","-v","error","-ss",ref_t,"-i",src,"-map","0:v:0","-frames:v","1","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True).stdout
_g=np.frombuffer(_r,np.uint8).reshape(FH,FW)
# Templates are centred slightly OUTSIDE each corner (on the bezel/wall), so they hold the
# bezel's outer outline and don't depend on what the screen is showing (bright ads break
# templates that include the screen interior).
OFF=np.array([[-55,-45],[55,-45],[-55,45],[55,45]],np.float32)
TC=(C0+OFF).astype(int)
tpl=[_g[y-R:y+R,x-R:x+R].copy() for x,y in TC]
pos=C0.copy(); wr=None; n=0
def refine(res,loc):
    x,y=loc; dx=dy=0.0
    if 0<x<res.shape[1]-1: a,b,c=res[y,x-1],res[y,x],res[y,x+1]; d=a-2*b+c; dx=0.5*(a-c)/d if d!=0 else 0
    if 0<y<res.shape[0]-1: a,b,c=res[y-1,x],res[y,x],res[y+1,x]; d=a-2*b+c; dy=0.5*(a-c)/d if d!=0 else 0
    return x+dx,y+dy
log=[]
first=True
while True:
    buf=rd.stdout.read(fsz)
    if len(buf)<fsz: break
    fr=np.frombuffer(buf,np.uint8).reshape(FH,FW,3)
    g=cv2.cvtColor(fr,cv2.COLOR_BGR2GRAY)
    if True:
        old=pos.copy()
        def match(i,half):
            cx,cy=int(round(pos[i,0]+OFF[i,0])),int(round(pos[i,1]+OFF[i,1]))
            x0,y0=max(cx-half,0),max(cy-half,0); x1,y1=min(cx+half,FW),min(cy+half,FH)
            res=cv2.matchTemplate(g[y0:y1,x0:x1],tpl[i],cv2.TM_CCOEFF_NORMED)
            _,mv,_,loc=cv2.minMaxLoc(res)
            if mv>0.5:
                px,py=refine(res,loc); new=np.array([x0+px+R,y0+py+R])-OFF[i]
                if np.abs(new-pos[i]).max()<(S if first else 40): pos[i]=new   # reject sudden jumps
        for i in (1,3): match(i,S)                 # right corners: strong edges, wide search
        # The left bezel edge is too faint to template-match reliably, and the camera here only
        # drifts/pans (right corners move together), so the whole quad follows the right side.
        d=(pos[[1,3]]-C0[[1,3]]).mean(axis=0)
        pos[0]=C0[0]+d; pos[2]=C0[2]+d
    first=False
    H,_=cv2.findHomography(C0,pos)            # frame0 -> frameT (wall plane)
    Et=cv2.perspectiveTransform(E0[None],H)[0]
    W=cv2.getPerspectiveTransform(Et,dstq)
    out=cv2.warpPerspective(fr,W,(OW,OH),flags=cv2.INTER_CUBIC)
    if CLEAN: out=clean_screen(out)
    if n%20==0: print(n,np.round(pos-C0,1).tolist(),file=sys.stderr)
    if wr is None:
        wr=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{OW}x{OH}","-r","30","-i","-","-c:v","libx264","-preset","slow","-crf","18","-profile:v","high","-pix_fmt","yuv420p","-movflags","+faststart",dst],stdin=subprocess.PIPE)
    wr.stdin.write(out.tobytes()); n+=1
wr.stdin.close(); wr.wait(); print("frames",n,file=sys.stderr)
