import React, { useState, useRef, useEffect } from 'react';
import { Send, SmilePlus, Brush } from 'lucide-react';
import Draggable from 'react-draggable';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [elements, setElements] = useState([]);
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3498db'); // Default to a cool blue
  const [brushSize, setBrushSize] = useState(5); // Slightly thicker brush
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingHistoryRef = useRef([]);

  const stickers = [
    { id: 1, type: 'emoji', content: '🌟', name: 'star' },
    { id: 2, type: 'emoji', content: '🎨', name: 'art' },
    { id: 3, type: 'emoji', content: '🌈', name: 'rainbow' },
    { id: 4, type: 'emoji', content: '💖', name: 'heart' },
    { id: 5, type: 'emoji', content: '✨', name: 'sparkle' },
    { id: 6, type: 'gif', content: '/laughing-429_256.gif', name: 'gif1' },
    { id: 11, type: 'gif', content: '/rocket-12318_256.gif', name: 'gif2' },
    { id: 12, type: 'gif', content: '/bee-11140_256.gif', name: 'gif3' },
    { id: 13, type: 'gif', content: '/magic-5966_256.gif', name: 'gif4' },
    { id: 14, type: 'gif', content: '/eyes-4836_256.gif', name: 'gif5' },

    { id: 7, type: 'image', content: '/rb_2149311079.png', name: 'image1' },
    { id: 8, type: 'image', content: '/image.png', name: 'image2' },
    { id: 9, type: 'image', content: '/coloured-nebula-background.png', name: 'image3' },
    { id: 10, type: 'image', content: '/with.png', name: 'image4' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctxRef.current = ctx;

        // Restore previous drawings with animations
        drawingHistoryRef.current.forEach((path) => {
          if (path.type === 'stroke') {
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.brushSize;
            ctx.moveTo(path.points[0].x, path.points[0].y);
            path.points.forEach((point) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
        });
      }
    }
  }, [color, brushSize]); // Reinitialize when color or brushSize changes

  const currentPathRef = useRef([]);

  const startDrawing = (e) => {
    if (!drawingMode || !canvasRef.current || !ctxRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);

    currentPathRef.current = [{ x, y }];
  };

  const draw = (e) => {
    if (!isDrawing || !drawingMode || !ctxRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    currentPathRef.current.push({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing || !ctxRef.current) return;

    setIsDrawing(false);

    if (currentPathRef.current.length > 0) {
      drawingHistoryRef.current.push({
        type: 'stroke',
        points: [...currentPathRef.current],
        color: color,
        brushSize: brushSize,
      });
    }
    currentPathRef.current = [];
  };

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const addSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      type: sticker.type,
      content: sticker.content,
      position: { x: 200, y: 200 },
    };
    setElements((prevElements) => [...prevElements, newSticker]);
    setShowStickers(false);
  };

  const handleDrag = (e, data, id) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, position: { x: data.x, y: data.y } } : el
      )
    );
  };

  const handleSend = () => {
    if (text.trim()) {
      const newMessage = {
        id: Date.now(),
        type: 'text',
        content: text,
        position: { x: Math.random() * (window.innerWidth - 200), y: Math.random() * (window.innerHeight - 200) },
        animation: true,
      };
      setElements((prevElements) => [...prevElements, newMessage]);
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const TextMessage = ({ content, animation }) => (
    <div
      className={`p-3 bg-gradient-to-br from-yellow-400 to-red-500 rounded-lg shadow-lg text-white font-medium transform transition-transform ${animation ? 'animate-fade-in' : ''}`}
      style={{ animation: animation ? 'messageAppear 0.5s ease-out forwards' : 'none' }}
    >
      {content}
    </div>
  );

  const WelcomeScreen = () => (
    <div className="h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <h1 className="text-5xl font-bold mb-4 animate-fade-in">Welcome to Peepy Chat</h1>
      <button
        onClick={() => setCurrentScreen('chat')}
        className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:bg-gradient-to-l text-white px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105"
      >
        Start Chatting
      </button>
    </div>
  );

  const MainChatScreen = () => (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-black text-white relative">
      <style>
        {`
          @keyframes messageAppear {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.8);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-fade-in {
            animation: messageAppear 0.5s ease-out forwards;
          }
        `}
      </style>

      <div className="bg-black/30 backdrop-blur-md p-4 flex justify-between items-center shadow-lg">
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="p-2 transition-transform hover:scale-105"
        >
          Back
        </button>
        <h1 className="text-xl font-bold text-yellow-500">Main Chat</h1>
      </div>

      <Draggable>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          style={{
            zIndex: drawingMode ? 10 : 1,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      </Draggable>

      <div className="relative h-[calc(100vh-8rem)] overflow-hidden">
        {elements.map((element) => (
          <Draggable
            key={element.id}
            position={element.position}
            onStop={(e, data) => handleDrag(e, data, element.id)}
          >
            <div className="absolute cursor-pointer">
              {element.type === 'text' && (
                <TextMessage content={element.content} animation={element.animation} />
              )}
              {element.type === 'emoji' && (
                <span className="text-4xl transform transition-transform hover:scale-125">
                  {element.content}
                </span>
              )}
              {element.type === 'image' && (
                <img
                  src={element.content}
                  alt="sticker"
                  className="w-20 h-20 transform transition-transform hover:scale-125"
                />
              )}
              {element.type === 'gif' && (
                <img
                  src={element.content}
                  alt="gif"
                  className="w-21 h-21 transform transition-transform hover:scale-125"
                />
              )}
            </div>
          </Draggable>
        ))}
      </div>

      <div className="relative p-4 z-20">
        <div className="flex space-x-4 items-center mb-4">
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="text-2xl hover:text-white transform transition-transform hover:scale-125"
          >
            <SmilePlus />
          </button>
          <button
            onClick={toggleDrawingMode}
            className={`text-2xl hover:text-white transform transition-transform hover:scale-125 ${drawingMode ? 'text-blue-500' : ''}`}
          >
            <Brush />
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm">{brushSize}px</span>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-white/10 rounded-lg border border-white/30 focus:outline-none focus:border-blue-500 transition-all"
          />
          <button
            onClick={handleSend}
            className="p-3 text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-gradient-to-l transform transition-all hover:scale-110"
          >
            <Send />
          </button>
        </div>
      </div>

      {showStickers && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 p-4 bg-black/80 backdrop-blur-md rounded-lg z-20 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                className="cursor-pointer transform transition-transform hover:scale-110"
                onClick={() => addSticker(sticker)}
              >
                {sticker.type === 'emoji' && <span className="text-3xl">{sticker.content}</span>}
                {sticker.type === 'image' && <img src={sticker.content} alt="" className="w-12 h-12" />}
                {sticker.type === 'gif' && <img src={sticker.content} alt="gif" className="w-12 h-12" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {drawingMode && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-black/50"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        />
      )}
    </div>
  );

  return currentScreen === 'welcome' ? <WelcomeScreen /> : <MainChatScreen />;
};

export default App;
