import { useState, useRef } from 'react';
import '../Containers.css';
import eyeOpen from '../assets/eyeVisibile.svg';
import eyeClosed from '../assets/eyeClosed.svg';

interface Layer {
  id: number;
  name: string;
  visible: boolean;
}

export function Layers() { //CHATGPT SHIT.................................
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, name: 'Background', visible: true },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<number>(1);
  // State to track which layer is being renamed
  const [editingId, setEditingId] = useState<number | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    // Prevent dragging while typing
    if (editingId !== null) return; 
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newList = [...layers];
      const draggedItemContent = newList.splice(dragItem.current, 1)[0];
      newList.splice(dragOverItem.current, 0, draggedItemContent);
      
      dragItem.current = null;
      dragOverItem.current = null;
      setLayers(newList);
    }
  };

  // Function to update the layer name in state
  const handleRename = (id: number, newName: string) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, name: newName } : layer
    ));
  };

  const addLayer = () => {
    const newId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) + 1 : 1;
    const newLayer: Layer = { id: newId, name: `Layer ${newId}`, visible: true };
    setLayers([newLayer, ...layers]);
    setSelectedLayer(newId);
  };

  const removeSelectedLayer = () => {
    if (layers.length <= 1) return;
    const updatedLayers = layers.filter(layer => layer.id !== selectedLayer);
    setLayers(updatedLayers);
    if (updatedLayers.length > 0) {
      setSelectedLayer(updatedLayers[0].id);
    }
  };

  const toggleVisibility = (id: number) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  return (
    <div className="right">
      <div className="layers-container">
        <div className="layers-header">
          <span>Layers</span>
          <div className="layers-controls">
            <button className="control-btn" onClick={addLayer} title="Add Layer">+</button>
            <button 
              className="control-btn delete-btn" 
              onClick={removeSelectedLayer} 
              title="Remove Selected Layer"
              disabled={layers.length <= 1}
            >
              −
            </button>
          </div>
        </div>
        
        <div className="layers-list">
          {layers.map((layer, index) => (
            <div 
              key={layer.id} 
              className={`layer-item ${selectedLayer === layer.id ? 'active' : ''}`}
              onClick={() => setSelectedLayer(layer.id)}
              draggable={editingId === null} // Disable drag while editing
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <button 
                className="visibility-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer.id);
                }}
              >
                <img src={layer.visible ? eyeOpen : eyeClosed} alt="v" className="layer-eye-icon" />
              </button>

              {/* TOGGLE BETWEEN SPAN AND INPUT */}
              {editingId === layer.id ? (
                <input
                  className="layer-rename-input"
                  autoFocus
                  value={layer.name}
                  onChange={(e) => handleRename(layer.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent selecting layer on click
                />
              ) : (
                <span 
                  className="layer-name"
                  onDoubleClick={() => setEditingId(layer.id)}
                >
                  {layer.name}
                </span>
              )}

              <span className="drag-handle">⠿</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}