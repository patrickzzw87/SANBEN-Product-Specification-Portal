import React from 'react';
import { NamingPart } from '../types';

interface ModelBreakdownProps {
  parts: NamingPart[];
}

export const ModelBreakdown: React.FC<ModelBreakdownProps> = ({ parts }) => {
  return (
    <div className="my-8 p-6 bg-slate-50 border rounded-lg">
      <h3 className="text-lg font-bold mb-6 border-b pb-2">2.2 Model Naming Convention</h3>
      
      <div className="flex flex-col items-center">
        {/* The Code */}
        <div className="text-3xl font-mono font-bold tracking-wider mb-8 text-brand-900 flex gap-2">
          {parts.map((part, index) => (
             <React.Fragment key={index}>
                <span className={part.color}>{part.code}</span>
                {index < parts.length - 1 && <span className="text-gray-400">-</span>}
             </React.Fragment>
          ))}
        </div>

        {/* The Tree */}
        <div className="flex w-full max-w-2xl justify-between text-sm text-center relative gap-2">
            {parts.map((part, index) => (
                <div key={index} className="flex flex-col items-center flex-1 relative group">
                    <div className={`absolute -top-6 h-6 border-l-2 left-1/2 opacity-50`} style={{ borderColor: 'currentColor' }}></div>
                    {/* Dashed connector line (except for first/last logic simplified) */}
                    
                    <span className="font-semibold text-gray-700 bg-white px-2 z-10 border border-gray-100 rounded shadow-sm text-xs whitespace-nowrap min-w-[80px]">
                        {part.label}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1">{part.desc}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};