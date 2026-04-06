import { useState, useRef } from 'react';

/**
 * Fullscreen image viewer overlay with scroll-to-zoom and drag-to-pan.
 */
export default function ImageViewer({ src, onClose }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastMouse = useRef(null);
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => {
      const next = Math.min(Math.max(s * delta, 1), 5);
      if (next <= 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current || !lastMouse.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    dragging.current = false;
    lastMouse.current = null;
  };

  const reset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <button type="button" className="image-viewer-close" onClick={onClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
      <div
        ref={containerRef}
        className="image-viewer-container"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={reset}
      >
        <img
          src={src}
          alt="Your uploaded picture"
          className="image-viewer-img"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            cursor: scale > 1 ? 'grab' : 'default',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
