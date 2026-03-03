========================
    OBJECT STRUCTURE
========================

Objects begin as temporary objects, which is a way of saying the user is still crating them (e.g. still drawing a brush stroke). Any and all of these objects are then transformed via WASM into a single "template" structure shared between all files, which is render-ready, described below.


*Properties of an Obj (compressed, non-drawable object):*
* USER ID (number)
    ID of user who drew the object;
* OBJECT ID (number)
    ID of object (to keep track of objects, useful for images)
* OBJECT TYPE (string)
    Type of object to be drawn (used by rendered to infer how to interpret the object);
* POINTS (array of numbers)
    An array of points (<x,y> tuples).
* COLOR (<r,g,b,a> tuple of numbers)
    Used by some objects (e.g. simple shapes, brushes) to represent their color; 
* IMAGE (number | null)
    ID of image (null if object doesn't include an image)
* EXTRAARGS (array of numbers)
    Additional arguments, if needed to represent the object (otherwise an empty array)


*Properties of a GPUObj (render-ready object):*
* USER ID (number)
    ID of user who drew the object;
* OBJECT ID (number)
    ID of object (to keep track of objects, useful for images)
* OBJECT TYPE (string)
    Type of object to be drawn (used by rendered to infer how to interpret the object);
* VERTICES (array of numbers)
    An array of vertex data;
* INDICES (array of numbers)
    An array of vertex indices (used by renderer to know the order of triangle rasterization);
* IMAGE (WebGLTexture or null)
    ID of image (null if object doesn't include an image)



========================
   OBJECT DEFINITIONS
========================
*RECTANGLE*
    Represents the polygon that is the rectangle. As a regular object, it is geometrically represented by two points, those points are later extended to four in the process of converting the object into a render-ready object.

Extra arguments:
    This object does not have any extra arguments.
============================
*LINE*
    Represents a line. As a regular object, it is geometrically represented by two points and a thickness, which are later extended an appropriate rectangle drawn to represent the line. 

Extra arguments:
    * ExtraArgs[0] - line thickness (relative to canvas size). ExtraArgs[0] = 1 equals thickness of the canvas. 
============================
*CIRCLE*
    Represents a circle. As a regular object, it is geometrically represented by a point and a radius. They are later extended to an approximation of a circle using triangles. 

Extra arguments:
    * ExtraArgs[0] - circle radius.
============================
*TRIANGLE*
    Represents a triangle. As both a regular object and a render-ready object, it is represented by three points. 

Extra arguments:
    This object does not have any extra arguments.
============================

... ## To be extended