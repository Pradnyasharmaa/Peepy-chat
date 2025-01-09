import React, { useState, useRef, useEffect } from 'react';
import { Send, SmilePlus, Brush, Eraser, Image, Search } from 'lucide-react';
import { GiphyFetch } from '@giphy/js-fetch-api';

const App = () => {
  const [elements, setElements] = useState([]);
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3498db');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [giphySearch, setGiphySearch] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [action, setAction] = useState(null); // 'move', 'rotate', 'scale'
  const [startAngle, setStartAngle] = useState(0);
  const [startDistance, setStartDistance] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [background, setBackground] = useState('bg-gradient-to-br from-indigo-900 via-purple-800 to-black'); // Default background
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Initialize Giphy client
  const gf = new GiphyFetch('yeXpB7G9N74CYoTT981xFMr5pzaUmdq8'); // Replace with your API key

  const emojis = ['😀', '😍', '🎨', '🌟', '💖', '✨', '🎮', '🎯', '🎪', '🎭', '🎨', '🎪'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctxRef.current = ctx;
    }
  }, [color, brushSize]);

  // Fetch Giphy stickers/GIFs
  const searchGiphy = async (query) => {
    try {
      const { data } = await gf.search(query, { limit: 20, type: 'stickers' });
      setGiphyResults(data);
    } catch (error) {
      console.error('Error fetching from Giphy:', error);
    }
  };

  useEffect(() => {
    if (giphySearch.length > 2) {
      const debounceTimeout = setTimeout(() => {
        searchGiphy(giphySearch);
      }, 500);
      return () => clearTimeout(debounceTimeout);
    }
  }, [giphySearch]);

  // Mouse control helpers
  const getCenter = (element) => ({
    x: element.position.x + (element.width || 100) / 2,
    y: element.position.y + (element.height || 100) / 2
  });

  const getAngle = (center, point) => {
    return Math.atan2(point.y - center.y, point.x - center.x);
  };

  const getDistance = (center, point) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = (e, element) => {
    if (!element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setSelectedElement(element);

    // Determine action based on where the mouse was clicked
    const center = getCenter(element);
    const angle = getAngle(center, { x: mouseX, y: mouseY });
    const distance = getDistance(center, { x: mouseX, y: mouseY });

    setStartAngle(angle);
    setStartDistance(distance);

    if (e.altKey) {
      setAction('rotate');
    } else if (e.shiftKey) {
      setAction('scale');
    } else {
      setAction('move');
    }
  };

  const handleMouseMove = (e) => {
    if (!selectedElement || !action) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setElements(prevElements => 
      prevElements.map(el => {
        if (el.id !== selectedElement.id) return el;

        const center = getCenter(el);
        
        switch (action) {
          case 'move':
            return {
              ...el,
              position: { x: mouseX - 50, y: mouseY - 50 }
            };
          
          case 'rotate':
            const currentAngle = getAngle(center, { x: mouseX, y: mouseY });
            const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
            return {
              ...el,
              rotation: (el.rotation || 0) + deltaAngle
            };
          
          case 'scale':
            const currentDistance = getDistance(center, { x: mouseX, y: mouseY });
            const scale = currentDistance / startDistance;
            return {
              ...el,
              scale: Math.max(0.1, Math.min(3, scale))
            };
          
          default:
            return el;
        }
      })
    );
  };

  const handleMouseUp = () => {
    setSelectedElement(null);
    setAction(null);
  };

  const Element = ({ element }) => (
    <div
      className={`absolute cursor-move transition-transform ${selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.position?.x || 0,
        top: element.position?.y || 0,
        transform: `scale(${element.scale || 1}) rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center',
      }}
      onMouseDown={(e) => handleMouseDown(e, element)}
    >
      <div className="relative group">
        {element.type === 'text' && (
          <div className="p-4 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-lg text-white">
            {element.content}
          </div>
        )}
        {element.type === 'emoji' && (
          <span className="text-4xl select-none">{element.content}</span>
        )}
        {(element.type === 'image' || element.type === 'gif') && (
          <img
            src={element.content}
            alt="media"
            className="max-w-xs max-h-xs object-contain select-none"
            draggable="false"
          />
        )}
        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 left-0 text-xs text-white bg-black/50 p-1 rounded">
          Hold Alt to rotate • Hold Shift to scale
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`h-screen ${background} overflow-hidden`} // Dynamically set background
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Drawing tools */}
      {drawingMode && (
        <div className="p-4 flex gap-4 absolute top-4 left-4 z-10">
          <div className="flex items-center gap-4 bg-gray-800 p-2 rounded">
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (ctxRef.current) ctxRef.current.strokeStyle = e.target.value;
              }}
              className="w-8 h-8"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => {
                setBrushSize(Number(e.target.value));
                if (ctxRef.current) ctxRef.current.lineWidth = Number(e.target.value);
              }}
              className="w-32"
            />
            <button
              onClick={() => {
                setIsEraser(!isEraser);
                if (ctxRef.current) {
                  ctxRef.current.strokeStyle = !isEraser ? '#FFFFFF' : color;
                }
              }}
              className={`p-2 rounded ${isEraser ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <Eraser size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 ${drawingMode ? 'cursor-crosshair' : ''}`}
        onMouseDown={(e) => {
          if (!drawingMode || !ctxRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          ctxRef.current.beginPath();
          ctxRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
          setIsDrawing(true);
        }}
        onMouseMove={(e) => {
          if (!isDrawing || !drawingMode || !ctxRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          ctxRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
          ctxRef.current.stroke();
        }}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
      />

      {/* Elements */}
      <div className="relative h-[calc(100vh-8rem)]">
        {elements.map((element) => (
          <Element key={element.id} element={element} />
        ))}
      </div>

      {/* Bottom controls */}
      <div className="fixed bottom-4 left-4 right-4 flex gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              setElements(prev => [...prev, {
                id: Date.now(),
                type: 'text',
                content: text.trim(),
                position: { x: 200, y: 200 },
                scale: 1,
                rotation: 0,
              }]);
              setText('');
            }
          }}
          className="flex-1 bg-gray-800 text-white rounded px-4 py-2"
          placeholder="Type a message..."
        />
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          <SmilePlus className="text-white" />
        </button>
        <button
          onClick={() => setShowGiphyPicker(!showGiphyPicker)}
          className="p-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          <Image className="text-white" />
        </button>
        <button
          onClick={() => setDrawingMode(!drawingMode)}
          className={`p-2 rounded hover:bg-opacity-80 ${drawingMode ? 'bg-blue-500' : 'bg-gray-800'}`}
        >
          <Brush className="text-white" />
        </button>
        {/* Button to change background */}
        <button
          onClick={() => setBackground(prev => 
            prev === 'bg-gradient-to-br from-indigo-900 via-purple-800 to-black' 
              ? 'bg-gradient-to-br from-pink-100 via-purple-200 to-indigo-300' 
              : 'bg-gradient-to-br from-indigo-900 via-purple-800 to-black')}
          className="p-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          Change Background
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 bg-gray-800 p-4 rounded-lg grid grid-cols-4 gap-2">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                setElements(prev => [...prev, {
                  id: Date.now(),
                  type: 'emoji',
                  content: emoji,
                  position: { x: 200, y: 200 },
                  scale: 1,
                  rotation: 0,
                }]);
                setShowEmojiPicker(false);
              }}
              className="text-2xl hover:bg-gray-700 p-2 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Giphy picker */}
      {showGiphyPicker && (
        <div className="absolute bottom-20 right-4 bg-gray-800 p-4 rounded-lg w-96">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search for GIFs"
              value={giphySearch}
              onChange={(e) => setGiphySearch(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded px-4 py-2"
            />
            <button
              onClick={() => searchGiphy(giphySearch)}
              className="p-2 bg-blue-600 text-white rounded"
            >
              <Search size={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {giphyResults.map((giphy) => (
              <button
                key={giphy.id}
                onClick={() => {
                  setElements(prev => [...prev, {
                    id: Date.now(),
                    type: 'gif',
                    content: giphy.images.downsized.url,
                    position: { x: 200, y: 200 },
                    scale: 1,
                    rotation: 0,
                  }]);
                  setShowGiphyPicker(false);
                }}
              >
                <img
                  src={giphy.images.fixed_height.url}
                  alt="gif"
                  className="w-full h-auto rounded-lg"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
