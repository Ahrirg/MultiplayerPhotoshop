============================================================
  Description of the components and uses of this directory
============================================================

# Responsibilities:
* Defining drawable objects and manipulating them; 
* Handling user inputs related to the canvas (object generation and selection); 
* Handling rendering; 
* Handling additional tasks related to the appearance and behaviour of the canvas. 

# Objects
There are two kinds of objects, *Obj* and *GPUObj*, where the former represents a compressed version of an object with more attributes than the latter, and the latter represents objects with just enough information to render them, and nothing else. *GPUObjects* are used internally for rendering, the rest of the system should think in terms ob *Obj* objects. 

# Object generation
Objects can be generated via user input relative to the canvas, when a tool is selected (or possibly in other ways, e.g. pasting an image). With most tools, pressing the left mouse button initiates drawing by setting the user's state accordingly (a separate module exists for states, regarding what the user is doing, tools selected and so forth). As the object is being generated (no indication of completion, a.k.a. the left mouse button has not been released), it is continuously updated *only* client-side, as a temporary object. The temporary object is provided with a special ID (-1, possibly null (NOTE: decide)), and a long-term ID is only provided by the server once the object generation is completed and the object is sent off to the server for distribution to other users. 

The process of object generation is guided by states inside of the *player_state.ts* file, which are determined by user inputs and existing states (e.g. "idle", "drawing", "selected"). 

# Object selection
Existing objects are selected for modification if the user presses the left mouse button while hovering their cursor over the bounding box of an object (if the cursor hovers over multiple such boxes, the object with the highest ID (the latest object) is selected). When selected, a wireframe box surrounds the selected object to show that selection has occurred. Selection is treated as a state. Selected obejcts can be moved, resized or stretched, some of their properties can be adjusted, depending on the specifico object. 

# Player input philosophy
A single module, *player_state.ts* is responsible for representing the player's current state (e.g. whether the player is idle, drawing, selected an object, also things like the cursor position and selected tool as well as color). Another module named *input_handling.ts* handles player inputs and updates the player state accordingly. The player state is then used directly in updating the objects or canvas accordingly - this code is entirely separated from user inputs and is only concerned with the state of the player during a single frame. 

# Object generation philosophy
If a player's state includes a selected tool and the player is idle, clicking on the canvas with the left mouse button induces a drawing state which lasts until the left mouse button is released. Each frame, the state is checked to see if the player is drawing, and if so, the temporary object (with ID=-1) is updated depending on the nature of the object being drawn (e.g. with brush strokes, a new point is added to the array of points representing the brush stroke, whereas if a rectange is being drawn, the second point representing the rectangle is replaced by the current position of the cursor *NOTE: might make the code more modular by, instead of writing separate methods for updating each object, we could have a single method with "ADD_POINT" or "UPDATE_POINT" flags or something similar*). 

# Object finalization philosophy
Once an object has been generated on the client's side, a message is sent to the server about its creation, and a response is awaited including the true ID of the object (rather than the dummy negative ID provided during the generation process). (*what do we do until we receive the ID? What if we draw multiple objects until we receive their IDs? We can use other negative temporary IDs, but how do we connect them to messages from the server to replace them with proper IDs? Keep in mind that other players are also creating their own temporary objects.*)