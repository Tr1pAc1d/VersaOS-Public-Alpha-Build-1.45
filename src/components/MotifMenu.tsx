import React, { useEffect, useRef } from 'react';

export interface MenuItem {
  label?: string;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface MotifMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export const MotifMenu: React.FC<MotifMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-[#8A8A8A] border-2 border-t-[#E0E0E0] border-l-[#E0E0E0] border-b-[#000000] border-r-[#000000] min-w-[160px] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex flex-col py-1">
        {items.map((item, idx) => {
          if (item.divider) {
            return (
              <div key={idx} className="my-1 border-t-2 border-b-2 border-t-[#8A8A8A] border-b-[#E0E0E0] h-0" />
            );
          }
          return (
            <div
              key={idx}
              className={`px-4 py-1 text-black font-sans text-sm cursor-pointer select-none border-2 border-transparent hover:border-t-[#000000] hover:border-l-[#000000] hover:border-b-[#E0E0E0] hover:border-r-[#E0E0E0] ${item.disabled ? 'text-gray-500 pointer-events-none' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled && item.action) {
                  item.action();
                  onClose();
                }
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
