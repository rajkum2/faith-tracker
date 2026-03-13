"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTelanganaSites, useSourceComparison } from "@/hooks/data/use-telangana-sites";
import type { TelanganaSite } from "@/hooks/data/use-telangana-sites";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Search, MapPin, Star, Loader2, Database, Map as MapIcon } from "lucide-react";
import type { FaithType } from "@/lib/data/types/faith-sites";
import { FAITH_COLORS, FAITH_NAMES, ALL_FAITHS } from "@/lib/data/types/faith-sites";
import dynamic from "next/dynamic";

// Dynamic import for the map
const DynamicTelanganaMap = dynamic(() => import("@/components/faith-tracker/telangana-map"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-sm text-slate-400">Loading Telangana map...</div>
    </div>
  )
});

// ─── Loading Component ────────────────────────────────────────

function LoadingScreen({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <div className="text-sm text-slate-600 mb-2">Loading Telangana faith sites...</div>
      <div className="w-64">
        <Progress value={progress} className="h-2" />
      </div>
      <div className="text-xs text-slate-400 mt-2">{Math.min(progress, 100).toFixed(0)}%</div>
    </div>
  );
}

// ─── Filter Badge Component ───────────────────────────────────

function FilterBadge({ 
  label, 
  count, 
  active, 
  onClick,
  color 
}: { 
  label: string; 
  count: number; 
  active: boolean; 
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all",
        active
          ? "text-white border-transparent"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {color && (
        <span 
          className={cn("w-2 h-2 rounded-full", !active && "border border-slate-300")}
          style={{ backgroundColor: active ? 'white' : color }}
        />
      )}
      <span>{label}</span>
      <span className={cn("text-[10px]", active ? "text-white/80" : "text-slate-400")}>
        {count.toLocaleString()}
      </span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function TelanganaPage() {
  const [search, setSearch] = useState("");
  const [selectedFaiths, setSelectedFaiths] = useState<FaithType[]>(ALL_FAITHS);
  const [selectedSource, setSelectedSource] = useState<'all' | 'osm' | 'google'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<TelanganaSite | null>(null);
  // Filters are always shown inline now
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Load data FIRST
  const { data: sites, allSites, isLoading, stats } = useTelanganaSites({
    search: search || undefined,
    source: selectedSource,
    minRating: minRating > 0 ? minRating : undefined,
  });

  const { comparison } = useSourceComparison();
  
  // Handle marker click from map
  const handleMarkerClick = useCallback((siteRef: { id: string }) => {
    const site = sites.find(s => s.id === siteRef.id);
    if (site) {
      setSelectedSite(site);
    }
  }, [sites]);

  // Simulate loading progress
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 150);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  // Handle faith toggle
  const handleFaithToggle = useCallback((faith: FaithType) => {
    setSelectedFaiths(prev => {
      if (prev.includes(faith)) {
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== faith);
      }
      return [...prev, faith];
    });
  }, []);

  // Select all/none
  const selectAllFaiths = useCallback(() => setSelectedFaiths(ALL_FAITHS), []);
  const clearAllFaiths = useCallback(() => setSelectedFaiths([]), []);

  // Calculate filtered counts for display
  const filteredCounts = useMemo(() => {
    const counts: Partial<Record<FaithType, number>> = {};
    sites.forEach(site => {
      counts[site.faith] = (counts[site.faith] || 0) + 1;
    });
    return counts as Record<FaithType, number>;
  }, [sites]);

  // Pagination logic
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sites, currentPage]);

  const totalPages = useMemo(() => Math.ceil(sites.length / ITEMS_PER_PAGE), [sites]);
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFaiths, selectedSource, minRating]);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return (
    <div className="flex flex-col bg-slate-50 h-full min-h-0 overflow-hidden">
      {/* Compact Header */}
      <div className="px-3 py-2 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-shrink-0 w-44">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 h-7 text-xs bg-slate-50"
            />
          </div>

          {/* Source Filter - Compact */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
            {(['all', 'osm', 'google'] as const).map(source => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={cn(
                  "px-2 py-0.5 text-[11px] rounded-md transition-all capitalize",
                  selectedSource === source
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {source}
                {stats?.bySource?.[source] && (
                  <span className="ml-0.5 text-[9px] text-slate-400">
                    {stats.bySource[source]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Faith Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {ALL_FAITHS.map(faith => (
              <button
                key={faith}
                onClick={() => handleFaithToggle(faith)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border transition-all whitespace-nowrap",
                  selectedFaiths.includes(faith)
                    ? "text-white border-transparent"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
                style={selectedFaiths.includes(faith) ? { backgroundColor: FAITH_COLORS[faith] } : undefined}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{FAITH_NAMES[faith]}</span>
                <span className={cn(
                  "text-[9px]",
                  selectedFaiths.includes(faith) ? "text-white/80" : "text-slate-400"
                )}>
                  {filteredCounts[faith] || 0}
                </span>
              </button>
            ))}
            
            {selectedFaiths.length < ALL_FAITHS.length && (
              <button
                onClick={selectAllFaiths}
                className="text-[10px] text-primary hover:underline px-1 flex-shrink-0"
              >
                All
              </button>
            )}
            <span className="text-slate-300 flex-shrink-0">|</span>
            <button
              onClick={clearAllFaiths}
              className="text-[10px] text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              Clear
            </button>
            
            {/* Rating Filter - Compact */}
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <Slider
                value={[minRating]}
                onValueChange={([v]) => setMinRating(v)}
                min={0}
                max={5}
                step={0.5}
                className="w-20"
              />
              <span className="text-[10px] text-slate-500 w-8">{minRating > 0 ? `${minRating}+` : 'Any'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sites list panel */}
        <div className="w-[400px] border-r border-slate-100 bg-white flex flex-col">
          {/* Stats bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold text-slate-900">{sites.length}</span>
              <span className="text-slate-500 text-xs ml-1">sites shown</span>
            </div>
            
            {stats?.avgRating && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                Avg {stats.avgRating}
              </div>
            )}
          </div>

          {/* Sites list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sites.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                No sites match your filters
              </div>
            ) : (
              paginatedSites.map(site => (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  onMouseEnter={() => setHoveredId(site.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    hoveredId === site.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Faith icon */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${FAITH_COLORS[site.faith]}20` }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: FAITH_COLORS[site.faith] }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {site.name}
                      </div>
                      
                      {/* Meta row */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge 
                          className="text-[9px] px-1.5 py-0 h-4"
                          style={{ 
                            backgroundColor: `${FAITH_COLORS[site.faith]}15`,
                            color: FAITH_COLORS[site.faith],
                          }}
                        >
                          {FAITH_NAMES[site.faith]}
                        </Badge>
                        
                        {site.rating && (
                          <div className="flex items-center gap-0.5 text-[10px] text-amber-600">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="font-medium">{site.rating}</span>
                            {site.reviews && (
                              <span className="text-slate-400">({site.reviews.toLocaleString()})</span>
                            )}
                          </div>
                        )}
                        
                        <Badge 
                          variant="outline" 
                          className="text-[8px] px-1 py-0 h-3.5 text-slate-400"
                        >
                          {site.source}
                        </Badge>
                      </div>
                      
                      {/* Address */}
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                        <MapPin size={10} />
                        <span className="truncate">{site.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-100 mt-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md transition-colors",
                    currentPage === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  ← Prev
                </button>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({sites.length} total)
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md transition-colors",
                    currentPage === totalPages
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map panel */}
        <div className="flex-1 relative h-full min-h-0">
          <DynamicTelanganaMap
            sites={sites}
            hoveredId={hoveredId}
            selectedFaiths={selectedFaiths}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={setHoveredId}
          />
        </div>
      </div>

      {/* Site detail drawer */}
      <Sheet open={selectedSite !== null} onOpenChange={() => setSelectedSite(null)}>
        <SheetContent className="w-[420px] overflow-y-auto">
          {selectedSite && (
            <>
              <SheetHeader>
                <SheetTitle className="text-base flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: FAITH_COLORS[selectedSite.faith] }}
                  />
                  {selectedSite.name}
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-5">
                {/* Faith badge */}
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
                  style={{ backgroundColor: FAITH_COLORS[selectedSite.faith] }}
                >
                  <span className="text-lg">
                    {selectedSite.faith === 'hinduism' && '🕉️'}
                    {selectedSite.faith === 'islam' && '☪️'}
                    {selectedSite.faith === 'christianity' && '✝️'}
                    {selectedSite.faith === 'sikhism' && '🪯'}
                    {selectedSite.faith === 'buddhism' && '☸️'}
                    {selectedSite.faith === 'jainism' && '🙏'}
                  </span>
                  <span className="font-medium">{FAITH_NAMES[selectedSite.faith]}</span>
                </div>

                {/* Rating */}
                {selectedSite.rating && (
                  <div className="bg-amber-50 rounded-lg p-4 flex items-center gap-4">
                    <div className="text-3xl font-bold text-amber-600">
                      {selectedSite.rating}
                    </div>
                    <div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star}
                            size={16} 
                            className={cn(
                              star <= Math.round(selectedSite.rating!)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            )}
                          />
                        ))}
                      </div>
                      {selectedSite.reviews && (
                        <div className="text-xs text-slate-500 mt-1">
                          {selectedSite.reviews.toLocaleString()} Google reviews
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={18} className="text-slate-400" />
                    <div>
                      <div className="text-slate-900">{selectedSite.city}</div>
                      <div className="text-xs text-slate-500">{selectedSite.state}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Database size={18} className="text-slate-400" />
                    <div>
                      <div className="text-slate-900 capitalize">{selectedSite.source} Places</div>
                      <div className="text-xs text-slate-500">Data source</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <MapIcon size={18} className="text-slate-400" />
                    <div className="text-slate-600">
                      {selectedSite.lat.toFixed(6)}, {selectedSite.lng.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* Source comparison */}
                {comparison && (
                  <div className="border-t border-slate-100 pt-4">
                    <div className="text-xs text-slate-500 mb-2">Also available in:</div>
                    <div className="flex gap-2">
                      {selectedSite.source === 'osm' && comparison.googleCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Google Places
                        </Badge>
                      )}
                      {selectedSite.source === 'google' && comparison.osmCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          OpenStreetMap
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={selectedSite.osm_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    View on {selectedSite.source === 'google' ? 'Google Maps' : 'OpenStreetMap'}
                  </a>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
