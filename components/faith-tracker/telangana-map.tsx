'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { TelanganaSite } from '@/hooks/data/use-telangana-sites';
import type { FaithType } from '@/lib/data/types/faith-sites';
import { FAITH_COLORS, FAITH_NAMES } from '@/lib/data/types/faith-sites';
import { cn } from '@/lib/utils';
import { Layers, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────

interface TelanganaMapProps {
  sites: TelanganaSite[];
  hoveredId: string | null;
  selectedFaiths: FaithType[];
  onMarkerClick: (site: { id: string }) => void;
  onMarkerHover: (id: string | null) => void;
}

// ─── Google Maps Style Teardrop Marker ─────────────────────────

function createGoogleMapsMarkerIcon(site: TelanganaSite, isHovered: boolean) {
  const color = FAITH_COLORS[site.faith] || '#95A5A6';
  const hasRating = site.rating && site.rating >= 4.5;
  const size = isHovered ? 32 : 28;
  
  // Google Maps style teardrop with optional rating badge
  const svg = hasRating
    ? `<svg width="${size}" height="${size * 1.5}" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path 
          d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14z" 
          fill="${color}" 
          stroke="white" 
          stroke-width="2.5"
          filter="url(#shadow)"
        />
        <circle cx="14" cy="14" r="5" fill="white"/>
        <circle cx="22" cy="6" r="6" fill="#fbbf24" stroke="white" stroke-width="2"/>
        <text x="22" y="9" text-anchor="middle" font-size="10" fill="#92400e">★</text>
      </svg>`
    : `<svg width="${size}" height="${size * 1.4}" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path 
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22c0-6.6-5.4-12-12-12z" 
          fill="${color}" 
          stroke="white" 
          stroke-width="2"
          filter="url(#shadow)"
        />
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>`;
  
  return L.divIcon({
    html: `<div style="
      display:flex;
      align-items:center;
      justify-content:center;
      transition: all 0.2s ease;
      transform: ${isHovered ? 'scale(1.15) translateY(-2px)' : 'scale(1)'};
    ">${svg}</div>`,
    className: 'google-style-marker',
    iconSize: hasRating ? L.point(size, size * 1.5) : L.point(size, size * 1.4),
    iconAnchor: hasRating 
      ? L.point(size / 2, size * 1.5 - 4) 
      : L.point(size / 2, size * 1.4 - 4),
    popupAnchor: L.point(0, hasRating ? -size * 1.5 + 10 : -size * 1.4 + 8),
  });
}

// ─── Custom cluster icon ─────────────────────────────────────

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 'small';
  let diameter = 32;
  if (count >= 100) { size = 'large'; diameter = 48; }
  else if (count >= 20) { size = 'medium'; diameter = 40; }

  return L.divIcon({
    html: `<div style="
      width:${diameter}px;height:${diameter}px;
      background:#1E40AF;
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${size === 'large' ? 14 : 12}px;font-weight:600;
      box-shadow:0 3px 8px rgba(0,0,0,0.35);
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(diameter, diameter),
  });
}

// ─── Compact Legend Component ─────────────────────────────────

function MapLegend({ clusteringEnabled, onToggleClustering }: { clusteringEnabled: boolean; onToggleClustering: () => void }) {
  return (
    <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md p-2">
      <div className="text-[10px] font-medium text-slate-700 mb-1.5">Legend</div>
      
      {/* Faith colors - compact grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
        {['hinduism', 'islam', 'christianity', 'sikhism', 'buddhism', 'jainism'].map(faith => (
          <div key={faith} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: FAITH_COLORS[faith as FaithType] }}
            />
            <span className="text-[9px] text-slate-600">{FAITH_NAMES[faith as FaithType]}</span>
          </div>
        ))}
      </div>
      
      {/* Clustering toggle */}
      <button
        onClick={onToggleClustering}
        className={cn(
          "w-full flex items-center justify-center gap-1 px-2 py-1 text-[10px] rounded transition-all border",
          clusteringEnabled 
            ? "bg-primary/10 text-primary border-primary/20" 
            : "text-slate-500 border-slate-200 hover:bg-slate-50"
        )}
      >
        {clusteringEnabled ? <Layers size={11} /> : <MapPin size={11} />}
        <span>{clusteringEnabled ? 'Grouped' : 'Individual'}</span>
      </button>
    </div>
  );
}

// ─── Memoized Marker Component ───────────────────────────────

const SiteMarker = React.memo(function SiteMarker({
  site,
  isHovered,
  onClick,
  onHover,
}: {
  site: TelanganaSite;
  isHovered: boolean;
  onClick: (site: { id: string }) => void;
  onHover: (id: string | null) => void;
}) {
  const icon = useMemo(() => createGoogleMapsMarkerIcon(site, isHovered), [site, isHovered]);
  
  const handleClick = useCallback(() => {
    onClick({ id: site.id });
  }, [onClick, site.id]);

  const handleMouseOver = useCallback(() => {
    onHover(site.id);
  }, [onHover, site.id]);

  const handleMouseOut = useCallback(() => {
    onHover(null);
  }, [onHover]);
  
  return (
    <Marker
      position={[site.lat, site.lng] as [number, number]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      }}
    >
      <Popup>
        <div className="min-w-[220px] max-w-[280px]">
          {/* Name */}
          <div className="font-medium text-sm mb-1 pr-6">
            {site.name}
          </div>
          
          {/* Faith badge */}
          <div 
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-white mb-2"
            style={{ backgroundColor: FAITH_COLORS[site.faith] }}
          >
            <span className="text-base">
              {site.faith === 'hinduism' && '🕉️'}
              {site.faith === 'islam' && '☪️'}
              {site.faith === 'christianity' && '✝️'}
              {site.faith === 'sikhism' && '🪯'}
              {site.faith === 'buddhism' && '☸️'}
              {site.faith === 'jainism' && '🙏'}
            </span>
            <span className="font-medium">{FAITH_NAMES[site.faith]}</span>
          </div>
          
          {/* Rating badge */}
          {site.rating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                <span className="text-amber-500">★</span>
                <span className="text-xs font-medium text-amber-700">{site.rating}</span>
                {site.reviews && (
                  <span className="text-[10px] text-amber-600/70">
                    ({site.reviews.toLocaleString()})
                  </span>
                )}
              </div>
              {site.rating >= 4.5 && (
                <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                  Top Rated
                </span>
              )}
            </div>
          )}
          
          {/* Location */}
          <div className="text-xs text-slate-500">
            {site.city}
            {site.source === 'google' && site.rating && (
              <span className="text-[10px] text-slate-400 ml-1">• Google Places</span>
            )}
          </div>
          
          {/* Click hint */}
          <div className="text-[10px] text-primary mt-2">
            Click for full details →
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

// ─── Main Component ───────────────────────────────────────────

export default function TelanganaMap({
  sites,
  hoveredId,
  selectedFaiths,
  onMarkerClick,
  onMarkerHover,
}: TelanganaMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(false); // Default: show individual markers
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hyderabad coordinates - fixed center
  const HYDERABAD_CENTER: [number, number] = [17.4065, 78.4772];
  const DEFAULT_ZOOM = 11;

  // Filter sites by selected faiths
  const filteredSites = useMemo(() => {
    if (selectedFaiths.length === 0) return [];
    if (selectedFaiths.length === 6) return sites;
    return sites.filter(site => selectedFaiths.includes(site.faith));
  }, [sites, selectedFaiths]);

  // Calculate stats
  const stats = useMemo(() => {
    const withRating = filteredSites.filter(s => s.rating).length;
    const topRated = filteredSites.filter(s => s.rating && s.rating >= 4.5).length;
    return { total: filteredSites.length, withRating, topRated };
  }, [filteredSites]);

  // Memoized callbacks
  const handleClick = useCallback((siteRef: { id: string }) => {
    onMarkerClick(siteRef);
  }, [onMarkerClick]);

  const handleHover = useCallback((id: string | null) => {
    onMarkerHover(id);
  }, [onMarkerHover]);

  const toggleClustering = useCallback(() => {
    setClusteringEnabled(prev => !prev);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-sm text-slate-400">Loading map...</div>
      </div>
    );
  }

  // Render markers (either clustered or individual)
  const renderMarkers = () => {
    const markers = filteredSites.map(site => (
      <SiteMarker
        key={site.id}
        site={site}
        isHovered={hoveredId === site.id}
        onClick={handleClick}
        onHover={handleHover}
      />
    ));

    if (clusteringEnabled) {
      return (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          animate={false}
          zoomToBoundsOnClick={true}
        >
          {markers}
        </MarkerClusterGroup>
      );
    }

    return markers;
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        className="w-full h-full"
        center={HYDERABAD_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        style={{ zIndex: 0 }}
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render markers based on clustering setting */}
        {renderMarkers()}
      </MapContainer>

      {/* Compact Stats overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-2.5 py-1.5">
        <div className="text-xs font-medium text-slate-700">
          {stats.total.toLocaleString()} sites
        </div>
        {stats.withRating > 0 && (
          <div className="text-[10px] text-slate-500">
            {stats.withRating} rated • {stats.topRated} top
          </div>
        )}
      </div>

      {/* Compact Legend with toggle */}
      <MapLegend clusteringEnabled={clusteringEnabled} onToggleClustering={toggleClustering} />
    </div>
  );
}
