'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  MapPin,
  FileText,
  Heart,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataQualityIndicatorProps {
  completenessScore: number;
  needsReview?: boolean;
  flags?: string[];
  lastVerified?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DataQualityIndicator({
  completenessScore,
  needsReview = false,
  flags = [],
  lastVerified,
  showDetails = false,
  size = 'md',
}: DataQualityIndicatorProps) {
  // Determine quality level
  const getQualityLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const quality = getQualityLevel(completenessScore);

  const sizeClasses = {
    sm: { text: 'text-[10px]', badge: 'text-[9px] h-4', icon: 10, progress: 'h-1' },
    md: { text: 'text-xs', badge: 'text-[10px] h-4', icon: 12, progress: 'h-1.5' },
    lg: { text: 'text-sm', badge: 'text-xs h-5', icon: 14, progress: 'h-2' },
  };

  const s = sizeClasses[size];

  return (
    <div className="space-y-2">
      {/* Main Score */}
      <div className={cn("flex items-center justify-between", s.text)}>
        <div className="flex items-center gap-1.5">
          <Info className={cn("text-slate-400", size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
          <span className="text-slate-600">Data Quality</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", quality.color)}>
            {completenessScore}%
          </span>
          <Badge 
            variant="secondary" 
            className={cn(s.badge, quality.bg, quality.color)}
          >
            {quality.label}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={completenessScore} 
        className={cn(s.progress, "bg-slate-100")}
      />

      {/* Details */}
      {showDetails && (
        <div className="pt-2 space-y-2 border-t border-slate-100 mt-2">
          {/* Individual Field Scores */}
          <div className="space-y-1.5">
            <FieldScore 
              icon={FileText} 
              label="Name" 
              present={completenessScore > 20}
              size={size}
            />
            <FieldScore 
              icon={Heart} 
              label="Faith" 
              present={completenessScore > 40}
              size={size}
            />
            <FieldScore 
              icon={MapPin} 
              label="Coordinates" 
              present={completenessScore > 60}
              size={size}
            />
            <FieldScore 
              icon={Building2} 
              label="Location (City/State)" 
              present={completenessScore > 80}
              size={size}
            />
          </div>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span className={cn("text-slate-600", s.text)}>Data Flags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {flags.map((flag, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className={cn(
                      s.badge,
                      "text-amber-600 border-amber-200 bg-amber-50"
                    )}
                  >
                    {formatFlag(flag)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Review Status */}
          {needsReview && (
            <div className={cn(
              "flex items-center gap-1.5 p-1.5 rounded",
              "bg-amber-50 border border-amber-100"
            )}>
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span className={cn("text-amber-700", s.text)}>
                Needs verification
              </span>
            </div>
          )}

          {/* Last Verified */}
          {lastVerified && (
            <div className={cn("text-slate-400", s.text)}>
              Last verified: {lastVerified}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for field scores
interface FieldScoreProps {
  icon: React.ElementType;
  label: string;
  present: boolean;
  size: 'sm' | 'md' | 'lg';
}

function FieldScore({ icon: Icon, label, present, size }: FieldScoreProps) {
  const sizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className={cn(
          "text-slate-400",
          size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )} />
        <span className={cn("text-slate-600", sizeClasses[size])}>{label}</span>
      </div>
      {present ? (
        <CheckCircle2 className={cn(
          "text-green-500",
          size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )} />
      ) : (
        <div className={cn(
          "text-slate-300",
          sizeClasses[size]
        )}>-</div>
      )}
    </div>
  );
}

// Format flag text
function formatFlag(flag: string): string {
  return flag
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export default DataQualityIndicator;
