import React from 'react';
import { cn } from '@/lib/utils';
import type { FaithType } from '@/lib/data/types/faith-sites';
import { FAITH_COLORS, FAITH_NAMES } from '@/lib/data/types/faith-sites';

export const ALL_FAITHS: FaithType[] = [
  'hinduism',
  'christianity',
  'islam',
  'sikhism',
  'buddhism',
  'jainism',
];

interface FaithFilterControlProps {
  selectedFaiths: FaithType[];
  onToggle: (faith: FaithType) => void;
  counts: Record<FaithType, number>;
}

export function FaithFilterControl({ selectedFaiths, onToggle, counts }: FaithFilterControlProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 max-w-[200px]">
      <h4 className="text-xs font-semibold text-slate-700 mb-2">Filter by Faith</h4>
      <div className="space-y-1.5">
        {ALL_FAITHS.map(faith => {
          const isSelected = selectedFaiths.includes(faith);
          const color = FAITH_COLORS[faith];
          const count = counts[faith] || 0;
          
          return (
            <button
              key={faith}
              onClick={() => onToggle(faith)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-all",
                isSelected 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <span 
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="flex-1 text-left">{FAITH_NAMES[faith]}</span>
              <span className="text-[10px] text-slate-400">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
