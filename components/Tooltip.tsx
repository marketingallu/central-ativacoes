'use client';
import { ReactNode } from 'react';

interface Props {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wide?: boolean;
}

const pos = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function Tooltip({ text, children, position = 'top', wide = false }: Props) {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span className={`absolute ${pos[position]} z-[9999] pointer-events-none hidden group-hover:block ${wide ? 'w-52' : 'w-44'}`}>
        <span className="block bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-2.5 py-1.5 shadow-xl text-center">
          {text}
        </span>
      </span>
    </span>
  );
}

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip text={text} wide>
      <span className="ml-1 cursor-help text-gray-300 hover:text-gray-400 text-[10px] border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center shrink-0">?</span>
    </Tooltip>
  );
}
