'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  PieChart,
  BarChart3,
  TrendingUp,
  Info
} from 'lucide-react';
import { FAITH_COLORS, FAITH_NAMES } from '@/lib/data/types/faith-sites';
import type { FaithType } from '@/lib/data/types/faith-sites';

interface DataStats {
  totalSites: number;
  validSites: number;
  completenessScore: number;
  faithDistribution: Record<FaithType, number>;
  regionDistribution: Record<string, number>;
  filesAnalyzed: number;
  lastUpdated: string;
}

interface DataStatsPanelProps {
  stats?: DataStats;
  isLoading?: boolean;
}

const DEFAULT_STATS: DataStats = {
  totalSites: 154896,
  validSites: 154896,
  completenessScore: 52.5,
  faithDistribution: {
    hinduism: 92428,
    christianity: 26676,
    islam: 20423,
    unknown: 8640,
    sikhism: 2858,
    buddhism: 2264,
    jainism: 1472,
    judaism: 69,
    zoroastrianism: 54,
    bahai: 6,
    indigenous: 6,
  },
  regionDistribution: {
    'South India': 116340,
    'Central India': 15894,
    'North India': 14082,
    'West India': 8517,
    'East India': 63,
  },
  filesAnalyzed: 8,
  lastUpdated: '2026-03-13',
};

export function DataStatsPanel({ 
  stats = DEFAULT_STATS, 
  isLoading = false 
}: DataStatsPanelProps) {
  const completionRate = stats.totalSites > 0 
    ? (stats.validSites / stats.totalSites) * 100 
    : 0;

  const topFaiths = Object.entries(stats.faithDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  const topRegions = Object.entries(stats.regionDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse" />
        <div className="h-32 bg-slate-100 rounded animate-pulse" />
        <div className="h-32 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500">Total Sites</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.totalSites.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.filesAnalyzed} data files
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500">Data Quality</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.completenessScore.toFixed(1)}%
            </div>
            <Progress 
              value={stats.completenessScore} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Faith Distribution */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <PieChart className="w-3.5 h-3.5" />
            Faith Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {topFaiths.map(([faith, count]) => {
              const percentage = (count / stats.totalSites) * 100;
              const color = FAITH_COLORS[faith as FaithType] || '#94A3B8';
              
              return (
                <div key={faith} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-slate-700">
                        {FAITH_NAMES[faith as FaithType] || faith}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      {count.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        backgroundColor: color, 
                        width: `${percentage}%` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Region Distribution */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            Regional Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1.5">
            {topRegions.map(([region, count]) => {
              const percentage = (count / stats.totalSites) * 100;
              
              return (
                <div 
                  key={region} 
                  className="flex items-center justify-between py-1 px-2 bg-slate-50 rounded"
                >
                  <span className="text-[11px] text-slate-700">{region}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      {count.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-[9px] h-4">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Info */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <div>
              <div className="text-[11px] font-medium text-blue-900">
                Data Quality Score: {stats.completenessScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-blue-700 mt-0.5">
                Based on completeness of name, location, faith, and coordinate fields. 
                Last updated: {stats.lastUpdated}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span className="text-[10px] text-slate-500">
            All {stats.filesAnalyzed} files validated
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] text-slate-500">
            {completionRate.toFixed(0)}% valid records
          </span>
        </div>
      </div>
    </div>
  );
}

export default DataStatsPanel;
