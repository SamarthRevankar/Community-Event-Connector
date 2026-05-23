import { useState, useRef, useEffect } from 'react';

/**
 * Reusable Tooltip component with smooth fade animation.
 *
 * Usage:
 *   <Tooltip text="Helpful info" position="top">
 *     <button>Hover me</button>
 *   </Tooltip>
 */
const Tooltip = ({ children, text, position = 'top', delay = 200 }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + 8;
        break;
      default:
        break;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    top = Math.max(8, top);

    setCoords({ top, left });
  }, [visible, position]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
        aria-describedby={visible ? 'tooltip' : undefined}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          id="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-lg pointer-events-none animate-tooltip-fade whitespace-nowrap"
        >
          {text}
          {/* Arrow */}
          <span
            className={`absolute w-2 h-2 bg-slate-900 transform rotate-45 ${
              position === 'top'
                ? '-bottom-1 left-1/2 -translate-x-1/2'
                : position === 'bottom'
                ? '-top-1 left-1/2 -translate-x-1/2'
                : position === 'left'
                ? '-right-1 top-1/2 -translate-y-1/2'
                : '-left-1 top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;
