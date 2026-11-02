"""Build the authored Kingdom Ember castle as a static GLB asset for Android."""
from pathlib import Path
import math
import numpy as np
import trimesh
from trimesh.transformations import rotation_matrix

scene=trimesh.Scene()
stone=(218,208,188); dark=(119,112,113); roof=(72,40,110)
gold=(211,163,75); wood=(80,49,41); glass=(89,171,199)
def add(mesh,name,color):
    mesh.visual.vertex_colors=np.tile(np.array([*color,255],dtype=np.uint8),(len(mesh.vertices),1))
    scene.add_geometry(mesh,geom_name=name)
def box(name,ext,pos,color):
    mesh=trimesh.creation.box(extents=ext)
    mesh.apply_translation(pos)
    add(mesh,name,color)
def cylinder(name,r,h,pos,color,n=16):
    mesh=trimesh.creation.cylinder(radius=r,height=h,sections=n)
    mesh.apply_transform(rotation_matrix(math.pi/2,[1,0,0]))
    mesh.apply_translation(pos)
    add(mesh,name,color)
def cone(name,r,h,pos,color,n=16):
    mesh=trimesh.creation.cone(radius=r,height=h,sections=n)
    mesh.apply_transform(rotation_matrix(-math.pi/2,[1,0,0]))
    mesh.apply_translation((pos[0],pos[1]-h/2,pos[2]))
    add(mesh,name,color)
def tower(name,x,z,h,r):
    cylinder(name+"_stone",r,h,(x,h/2+.24,z),stone,20)
    cylinder(name+"_cornice",r*1.18,.15,(x,h+.31,z),gold,20)
    cone(name+"_roof",r*1.48,.95,(x,h+.87,z),roof,20)
    for y in [.65,1.2,1.75]:
        cylinder(name+"_ring_"+str(y),r*1.035,.055,(x,y,z),dark,20)
    for a in range(8):
        ang=2*math.pi*a/8
        box(name+"_merlon_"+str(a),(.13,.17,.14),(x+math.sin(ang)*r*.85,h+.43,z+math.cos(ang)*r*.85),stone)
    box(name+"_finial",(.09,.24,.09),(x,h+1.46,z),gold)

box("foundation",(6.4,.38,6.4),(0,.08,0),dark)
box("courtyard",(5.7,.12,5.7),(0,.3,0),stone)
box("central_keep",(2.8,3.1,2.35),(0,1.95,-.35),stone)
box("keep_trim",(3.05,.14,2.6),(0,3.48,-.35),gold)
for sign in [-1,1]:
    m=trimesh.creation.box(extents=(2.15,.11,2.65))
    m.apply_transform(rotation_matrix(sign*math.pi/4,[0,0,1]))
    m.apply_translation((sign*.69,4.02,-.35))
    add(m,"keep_roof_"+str(sign),roof)
for x in [-2.45,2.45]:
    for z in [-2.4,2.4]: tower("outer_%s_%s"%(x,z),x,z,2.5,.51)
for x in [-1.3,1.3]: tower("inner_%s"%x,x,-1.3,3.4,.36)
for z in [-2.55,2.55]:
    box("wall_z"+str(z),(4.7,1.35,.34),(0,1,z),stone)
    for i in range(14):
        x=-2.22+i*.34
        if z>0 and abs(x)<.72:continue
        box("merlon_z%s_%s"%(z,i),(.2,.26,.4),(x,1.83,z),stone)
for x in [-2.58,2.58]:
    box("wall_x"+str(x),(.34,1.35,4.7),(x,1,0),stone)
    for i in range(14):
        box("merlon_x%s_%s"%(x,i),(.4,.26,.2),(x,1.83,-2.22+i*.34),stone)
for x in [-.83,.83]:
    box("gate_pillar_"+str(x),(.55,2.2,.65),(x,1.43,2.56),dark)
    box("gate_cap_"+str(x),(.7,.16,.8),(x,2.63,2.56),gold)
box("gate_lintel",(1.15,.35,.65),(0,2.36,2.55),stone)
box("oak_gate",(1.05,1.6,.12),(0,1.18,2.79),wood)
for i,x in enumerate(np.linspace(-.44,.44,7)):
    box("gate_plank_"+str(i),(.026,1.52,.03),(float(x),1.18,2.87),dark)
for y in [.7,1.55]: box("gate_strap_"+str(y),(1.03,.07,.08),(0,y,2.91),gold)
for z in [.85,-1.55]:
    for x in [-.86,0,.86]:
        box("window_%s_%s"%(x,z),(.3,.6,.06),(x,2.35,z),glass)
        box("sill_%s_%s"%(x,z),(.41,.09,.13),(x,2.03,z),gold)
for x in [-1.2,1.2]:
    box("banner_"+str(x),(.38,1,.05),(x,2.5,.9),(94,37,129))
    box("banner_mount_"+str(x),(.49,.07,.16),(x,3.02,.9),gold)
for i in range(4):
    box("entry_step_"+str(i),(1.55+i*.19,.13,.25),(0,.15+i*.08,3.05+i*.18),dark)
tower("royal_central_spire",0,-.35,4.65,.35)
for x in [-1.1,1.1]:
    for z in [-1.1,1.1]:
        box("buttress_%s_%s"%(x,z),(.24,1.55,.24),(x,1.05,z),dark)
box("roof_crest",(.13,.16,2.7),(0,4.72,-.35),gold)

# Architecture pass: distinct authored pieces instead of simply scaling a single keep.
# Geometry is shared in one GLB; runtime levels select tier-labelled pieces.
blue=(39,84,148); red=(157,40,48); violet=(113,46,160)
iron=(58,60,67); light=(243,205,126); timber=(128,81,43)
def beam(name,start,end,width,color):
    a=np.asarray(start,dtype=float); b=np.asarray(end,dtype=float)
    v=b-a; length=float(np.linalg.norm(v))
    mesh=trimesh.creation.box(extents=(width,length,width))
    mesh.apply_transform(trimesh.geometry.align_vectors([0,1,0],v/length))
    mesh.apply_translation((a+b)/2)
    add(mesh,name,color)
def arch(name,x,y,z,w,h,color):
    # Voussoirs form an actual curved silhouette, rather than a rectangular gate.
    for i in range(11):
        theta=math.pi*i/10
        px=x+math.cos(theta)*w/2
        py=y+math.sin(theta)*h
        brick=trimesh.creation.box(extents=(w/9,.18,.22))
        brick.apply_transform(rotation_matrix(theta-math.pi/2,[0,0,1]))
        brick.apply_translation((px,py,z))
        add(brick,name+"_voussoir_%02d"%i,color)
def banner(name,x,y,z,color):
    box(name+"_cloth",(.35,.84,.055),(x,y,z),color)
    box(name+"_rod",(.48,.06,.14),(x,y+.46,z),gold)
    cone(name+"_tip",.11,.23,(x,y-.5,z),color,4)
def timber_panels(name,x,z,front=True):
    for side in [-1,1]:
        bx=x+side*.36 if front else x
        bz=z if front else z+side*.36
        box(name+"_upright_"+str(side),(.09,1.32,.1),(bx,1.07,bz),timber)
    if front:
        beam(name+"_braceA",(x-.36,.45,z),(x+.36,1.67,z),.095,timber)
        beam(name+"_braceB",(x+.36,.45,z),(x-.36,1.67,z),.095,timber)
    else:
        beam(name+"_braceA",(x,.45,z-.36),(x,1.67,z+.36),.095,timber)
        beam(name+"_braceB",(x,.45,z+.36),(x,1.67,z-.36),.095,timber)

# Foundation stone courses, individual mortar gaps and corner quoins.
for y in [.48,.76,1.04,1.32]:
    for i in range(15):
        x=-2.35+i*.335+(0.16 if int(y*100)%2 else 0)
        for z in [-2.76,2.76]:
            if z>0 and abs(x)<.8:continue
            box("masonry_front_%s_%s_%s"%(y,i,z),(.31,.23,.025),(x,y,z),stone if i%4 else dark)
        z=-2.35+i*.335
        for xside in [-2.76,2.76]:
            box("masonry_side_%s_%s_%s"%(y,i,xside),(.025,.23,.31),(xside,y,z),stone if i%4 else dark)
for x in [-2.5,2.5]:
    for z in [-2.5,2.5]:
        for y in [.6,1.05,1.5]:
            box("corner_quoin_%s_%s_%s"%(x,z,y),(.65,.28,.65),(x,y,z),stone)
# Early fort timber cross bracing on curtain walls.
for x in [-1.8,1.8]:
    timber_panels("front_timber_"+str(x),x,2.77)
    timber_panels("back_timber_"+str(x),x,-2.77)
for z in [-1.8,1.8]:
    timber_panels("left_timber_"+str(z),-2.77,z,False)
    timber_panels("right_timber_"+str(z),2.77,z,False)
arch("gate_arch",0,1.85,2.94,1.25,.56,stone)
for x in [-.55,.55]:
    for y in [.85,1.45]:
        cylinder("gate_rivet_%s_%s"%(x,y),.045,.035,(x,y,2.98),iron,8)
for x in [-1.85,1.85]:
    banner("front_blue_banner_"+str(x),x,1.6,2.96,blue)
# Roof shingle courses, ridges and timber eaves.
for side in [-1,1]:
    for row in range(6):
        y=3.55+row*.16
        x=side*(1.38-row*.17)
        for z in np.linspace(-1.42,.75,9):
            box("keep_roof_shingle_%s_%s_%s"%(side,row,round(z,2)),(.29,.055,.28),(x,y,float(z)),timber if row%2 else wood)
for z in [-1.58,.9]:
    beam("keep_eave_"+str(z),(-1.55,3.48,z),(1.55,3.48,z),.12,gold)
# Glowing torch heads, brackets and courtyard furnishings.
for x in [-1.25,1.25]:
    box("torch_bracket_"+str(x),(.12,.12,.4),(x,1.8,2.96),iron)
    cylinder("torch_cup_"+str(x),.13,.22,(x,2.0,3.2),gold,10)
    cone("torch_flame_"+str(x),.13,.38,(x,2.33,3.2),(255,139,38),8)
for x,z in [(-1.7,-.6),(1.7,.8)]:
    box("courtyard_crate_"+str(x),(.6,.55,.6),(x,.6,z),wood)
    for side in [-1,1]:
        beam("crate_brace_%s_%s"%(x,side),(x-.28,.34,z+side*.31),(x+.28,.85,z+side*.31),.055,gold)
# Tier 9-16: larger fortified turrets and blue banners.
for x in [-2.35,2.35]:
    for z in [-2.35,2.35]:
        tower("tier9_turret_%s_%s"%(x,z),x,z,3.45,.48)
        banner("tier9_banner_%s_%s"%(x,z),x,2.25,z+(.53 if z>0 else -.53),blue)
for x in [-1.5,1.5]:
    box("tier9_inner_hall_%s"%x,(.95,1.45,1.4),(x,1.25,-.5),stone)
    box("tier9_hall_trim_%s"%x,(1.08,.13,1.5),(x,2.05,-.5),gold)
# Tier 17-24: red roofed corner spires, richer gate trim.
for x in [-2.25,2.25]:
    for z in [-2.25,2.25]:
        cone("tier17_red_spire_%s_%s"%(x,z),.83,1.5,(x,4.1,z),red,12)
        box("tier17_spire_finial_%s_%s"%(x,z),(.13,.35,.13),(x,5.08,z),gold)
        banner("tier17_red_banner_%s_%s"%(x,z),x,1.5,z+(.63 if z>0 else -.63),red)
arch("tier17_royal_arch",0,2.06,3.04,1.55,.7,gold)
# Tier 25-30: violet spires, faceted crystals and ceremonial finials.
for x,z in [(-2.3,-2.3),(2.3,-2.3),(-2.3,2.3),(2.3,2.3),(0,-.35)]:
    cone("tier25_amethyst_roof_%s_%s"%(x,z),.68,1.8,(x,4.85 if x else 6.2,z),violet,12)
    gem=trimesh.creation.icosphere(subdivisions=1,radius=.32)
    gem.apply_translation((x,5.95 if x else 7.35,z))
    add(gem,"tier25_crystal_%s_%s"%(x,z),(188,79,245))
    banner("tier25_violet_banner_%s_%s"%(x,z),x,2.35,z+(.55 if z>0 else -.55),violet)
arch("tier25_amethyst_arch",0,2.2,3.13,1.7,.85,gold)

target=Path("public/models/Royal_Castle_v095.glb")
target.parent.mkdir(parents=True,exist_ok=True)
scene.export(str(target))
print("Wrote",target,target.stat().st_size,"bytes;",len(scene.geometry),"meshes")
