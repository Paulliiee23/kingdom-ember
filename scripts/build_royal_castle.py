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
target=Path("public/models/Royal_Castle_v095.glb")
target.parent.mkdir(parents=True,exist_ok=True)
scene.export(str(target))
print("Wrote",target,target.stat().st_size,"bytes;",len(scene.geometry),"meshes")
