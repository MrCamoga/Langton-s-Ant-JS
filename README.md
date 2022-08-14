# Langton-s-Ant-JS
Fast implementation of 2D (90º, 45º and 60º), 3D and 4D Langton's Ant and 2D, 3D and 4D Turmites written in JS

##Rule notation

2D: F (no turn), R (90º), B (180º), L (270º)
hex: F (no turn), R (60º), r (120º), B (180º), l (240º), L (300º)
45deg: F (no turn), f (45º), R (90º), r (135º), B (180º), b (225º), L (270º), l (315º)
3D: R/L (90º/-90º XY plane), U/D (90º/-90º XZ plane)
4D: R/L (90º/-90º XY plane), U/D (90º/-90º XZ plane), X/Y (90º/-90º XW plane)

##TODO
 
	-hex and 45º turmites
	-merge common code
	-chunk based map
	-backwards simulation to find period (for ants, turmites are not reversible in general)
	-save GIFs/videos
	-render 3d rotation (WIP)
	-store 3d and 4d rotation tables in files