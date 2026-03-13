"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useFaithSites, useFaithSiteStats, useFaithSiteDetail } from "@/hooks/data/use-faith-sites";
import type { LightweightFaithSite } from "@/hooks/data/use-faith-sites";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Search, MapPin, Info, Globe, Loader2 } from "lucide-react";
import type { FaithType } from "@/lib/data/types/faith-sites";
import { FAITH_COLORS, FAITH_NAMES, ALL_FAITHS } from "@/lib/data/types/faith-sites";
import dynamic from "next/dynamic";

// Dynamic import for the map
const DynamicFaithMap = dynamic(() => import("@/components/faith-tracker/faith-map"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-sm text-slate-400">Loading map...</div>
    </div>
  )
});

// ─── Loading Progress Component ───────────────────────────────

function LoadingProgress({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <div className="text-sm text-slate-600 mb-2">Loading faith sites...</div>
      <div className="w-64">
        <Progress value={progress} className="h-2" />
      </div>
      <div className="text-xs text-slate-400 mt-2">{progress}%</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selectedFaiths, setSelectedFaiths] = useState<FaithType[]>(ALL_FAITHS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Load lightweight sites
  const { data: sites = [], allSites, isLoading } = useFaithSites({ 
    search: search || undefined,
  });
  
  // Load full detail when site selected
  const { data: selectedSiteDetail } = useFaithSiteDetail(selectedSiteId);
  
  // Get stats
  const { data: stats } = useFaithSiteStats();

  // Simulate loading progress
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  // Filter sites by selected faiths
  const filteredSites = useMemo(() => {
    if (selectedFaiths.length === 0) return [];
    return sites.filter(site => selectedFaiths.includes(site.faith));
  }, [sites, selectedFaiths]);

  // Pagination logic
  const paginatedSites = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSites, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredSites.length / ITEMS_PER_PAGE), [filteredSites]);
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFaiths]);

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

  // Select all faiths
  const selectAllFaiths = useCallback(() => setSelectedFaiths(ALL_FAITHS), []);

  // Calculate faith counts
  const faithCounts = useMemo(() => {
    const counts: Partial<Record<FaithType, number>> = {};
    allSites.forEach(site => {
      const faith = site.faith;
      counts[faith] = (counts[faith] || 0) + 1;
    });
    return counts as Record<FaithType, number>;
  }, [allSites]);

  // Handle site selection from list or map
  const handleSiteClick = useCallback((site: LightweightFaithSite | { id: string }) => {
    setSelectedSiteId(site.id);
  }, []);

  if (isLoading) {
    return <LoadingProgress progress={Math.min(loadingProgress, 100)} />;
  }

  return (
    <div className="flex flex-col bg-slate-50 h-full min-h-0 overflow-hidden">
      {/* Compact Toolbar */}
      <div className="px-3 py-1.5 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-shrink-0 w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 h-7 text-xs bg-slate-50"
            />
          </div>

          {/* Compact Faith filter chips */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {ALL_FAITHS.map(faith => {
              const isSelected = selectedFaiths.includes(faith);
              const color = FAITH_COLORS[faith];
              const count = faithCounts[faith] || 0;
              
              return (
                <button
                  key={faith}
                  onClick={() => handleFaithToggle(faith)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full border transition-all whitespace-nowrap",
                    isSelected
                      ? "text-white border-transparent"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                  style={isSelected ? { backgroundColor: color } : undefined}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? 'white' : color }}
                  />
                  <span>{FAITH_NAMES[faith]}</span>
                  <span className={cn(
                    "text-[9px]",
                    isSelected ? "text-white/80" : "text-slate-400"
                  )}>
                    {count > 0 && count.toLocaleString()}
                  </span>
                </button>
              );
            })}
            
            {selectedFaiths.length < ALL_FAITHS.length && (
              <button
                onClick={selectAllFaiths}
                className="text-[10px] text-primary hover:underline px-1"
              >
                All
              </button>
            )}
          </div>

          {/* Toggle list view */}
          <button
            onClick={() => setShowList(!showList)}
            className={cn(
              "ml-auto flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border transition-all flex-shrink-0",
              showList
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-600 border-slate-200"
            )}
          >
            <Info size={12} />
            {showList ? "Hide" : "List"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sites list panel */}
        {showList && (
          <div className="w-[380px] border-r border-slate-100 bg-white flex flex-col">
            {/* Stats header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {filteredSites.length.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">Places of Worship</div>
                </div>
                {stats && (
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Database</div>
                    <div className="text-sm font-medium text-slate-700">
                      {stats.total.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sites list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredSites.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                  No sites found
                </div>
              ) : (
                <>
                  {paginatedSites.map(site => (
                    <div
                      key={site.id}
                      onClick={() => handleSiteClick(site)}
                      onMouseEnter={() => setHoveredId(site.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        hoveredId === site.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {/* Faith color indicator */}
                        <div 
                          className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: FAITH_COLORS[site.faith] }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          {/* Name */}
                          <div className="font-medium text-sm text-slate-900 truncate">
                            {site.name}
                          </div>
                          
                          {/* Faith badge */}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className="text-[9px] px-1.5 py-0 h-4"
                              style={{ 
                                backgroundColor: `${FAITH_COLORS[site.faith]}20`,
                                color: FAITH_COLORS[site.faith],
                                borderColor: `${FAITH_COLORS[site.faith]}40`,
                              }}
                              variant="outline"
                            >
                              {FAITH_NAMES[site.faith]}
                            </Badge>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                            <MapPin size={10} />
                            <span>{site.city || site.state || site.region}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
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
                          ({filteredSites.length} total)
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
                </>
              )}
            </div>
          </div>
        )}

        {/* Map panel */}
        <div className="flex-1 relative h-full min-h-0">
          <DynamicFaithMap
            sites={filteredSites}
            hoveredId={hoveredId}
            selectedFaiths={selectedFaiths}
            onMarkerClick={handleSiteClick}
            onMarkerHover={setHoveredId}
            onFaithToggle={handleFaithToggle}
          />
        </div>
      </div>

      {/* Site detail drawer */}
      <Sheet open={selectedSiteId !== null} onOpenChange={() => setSelectedSiteId(null)}>
        <SheetContent className="w-[400px] overflow-y-auto">
          {selectedSiteDetail ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-base flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: FAITH_COLORS[selectedSiteDetail.faith.primary] }}
                  />
                  {selectedSiteDetail.name.english || selectedSiteDetail.name.local || "Unnamed Site"}
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-4 space-y-4">
                {/* Faith badge */}
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white"
                  style={{ backgroundColor: FAITH_COLORS[selectedSiteDetail.faith.primary] }}
                >
                  <span>{FAITH_NAMES[selectedSiteDetail.faith.primary]}</span>
                  {selectedSiteDetail.faith.denomination && (
                    <span className="text-white/80">• {selectedSiteDetail.faith.denomination}</span>
                  )}
                </div>

                {/* Local name */}
                {selectedSiteDetail.name.local && selectedSiteDetail.name.local !== selectedSiteDetail.name.english && (
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-400">Local name:</span> {selectedSiteDetail.name.local}
                  </div>
                )}

                {/* Location */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="text-slate-600">
                      {selectedSiteDetail.coordinates.lat.toFixed(6)}, {selectedSiteDetail.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                  
                  {selectedSiteDetail.location.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe size={16} className="text-slate-400" />
                      <span className="text-slate-600">
                        {selectedSiteDetail.location.city}
                        {selectedSiteDetail.location.state && `, ${selectedSiteDetail.location.state}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Info size={16} className="text-slate-400" />
                    <span className="text-slate-600">{selectedSiteDetail.location.region}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      selectedSiteDetail.living_site.is_active ? "bg-green-500" : "bg-slate-300"
                    )} />
                    <span className="text-sm text-slate-600">
                      {selectedSiteDetail.living_site.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    ID: {selectedSiteDetail.id}
                  </div>
                </div>

                {/* Data quality */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-xs text-slate-500 mb-2">Data Quality</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${selectedSiteDetail.data_quality.completeness_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedSiteDetail.data_quality.completeness_score}%
                    </span>
                  </div>
                  {selectedSiteDetail.data_quality.needs_review && (
                    <div className="text-[10px] text-amber-600 mt-1">
                      ⚠️ Needs review
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={selectedSiteDetail.osm_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-center"
                  >
                    View on OpenStreetMap
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
