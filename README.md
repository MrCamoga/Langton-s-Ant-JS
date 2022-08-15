# Langton-s-Ant-JS
Fast implementation of 2D (90º, 45º and 60º), 3D and 4D Langton's Ant and 2D, 3D and 4D Turmites written in JS

## Ant movement notation

- 2D: R L (±90º)
- hex: F R r B l L (0º, 60º, 120º,...)
- 45deg: F f R r B b L l (0º, 45º, 90º,...)
- 3D: R L U D (±90º xy and xz planes)
- 4D: R L U D X Y (±90º xy, xz and xw planes)

Turmites allow turning in any of the 6, 24 and 192 orientations (2d, 3d and 4d respectively).

## TODO

- hex and 45º turmites
- merge common code
- chunk based map
- backwards simulation to find period (for ants, turmites are not reversible in general)
- save GIFs/videos
- render 3d rotation (WIP)
- store 3d and 4d rotation tables in files
- higher dimensional ants (rotation table for 5d would be 1920x1920)