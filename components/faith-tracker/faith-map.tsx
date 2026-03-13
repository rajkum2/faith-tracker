'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { FaithType } from '@/lib/data/types/faith-sites';
import type { LightweightFaithSite } from '@/hooks/data/use-faith-sites';
import { FAITH_COLORS, FAITH_NAMES, FAITH_ICONS, ALL_FAITHS } from '@/lib/data/types/faith-sites';
import { cn } from '@/lib/utils';
import { Layers, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────

interface FaithMapProps {
  sites: LightweightFaithSite[];
  hoveredId: string | null;
  selectedFaiths: FaithType[];
  onMarkerClick: (site: { id: string }) => void;
  onMarkerHover: (id: string | null) => void;
  onFaithToggle?: (faith: FaithType) => void;
}

// ─── Google Maps Style Marker Icon ─────────────────────────────

function createGoogleMapsMarkerIcon(site: LightweightFaithSite, isHovered: boolean) {
  const color = FAITH_COLORS[site.faith] || '#95A5A6';
  const size = isHovered ? 32 : 28;
  
  // Google Maps style teardrop marker
  const svg = `
    <svg width="${size}" height="${size * 1.4}" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>
  `;
  
  return L.divIcon({
    html: `<div style="
      display:flex;
      align-items:center;
      justify-content:center;
      transition: all 0.2s ease;
      transform: ${isHovered ? 'scale(1.15) translateY(-2px)' : 'scale(1)'};
    ">${svg}</div>`,
    className: 'google-style-marker',
    iconSize: L.point(size, size * 1.4),
    iconAnchor: L.point(size / 2, size * 1.4 - 4),
    popupAnchor: L.point(0, -size * 1.4 + 8),
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

// ─── Compact Filter Control Component ────────────────────────

interface FaithFilterControlProps {
  selectedFaiths: FaithType[];
  onToggle: (faith: FaithType) => void;
  counts: Record<FaithType, number>;
  clusteringEnabled: boolean;
  onToggleClustering: () => void;
}

export function FaithFilterControl({ 
  selectedFaiths, 
  onToggle, 
  counts,
  clusteringEnabled,
  onToggleClustering,
  onFaithToggle,
}: FaithFilterControlProps & { onFaithToggle?: (faith: FaithType) => void }) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-lg shadow-md p-2 max-w-[220px]">
      {/* Compact faith toggles */}
      <div className="grid grid-cols-2 gap-1">
        {ALL_FAITHS.map(faith => {
          const isSelected = selectedFaiths.includes(faith);
          const color = FAITH_COLORS[faith];
          const count = counts[faith] || 0;
          
          return (
            <button
              key={faith}
              onClick={() => onFaithToggle ? onFaithToggle(faith) : onToggle(faith)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[10px] rounded transition-all",
                isSelected 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-400 hover:bg-slate-50"
              )}
              title={`${FAITH_NAMES[faith]} (${count})`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full border border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate flex-1 text-left">{FAITH_NAMES[faith]}</span>
              <span className="text-[9px] text-slate-400 flex-shrink-0">{count > 0 && count}</span>
            </button>
          );
        })}
      </div>
      
      {/* Clustering toggle */}
      <div className="border-t border-slate-100 mt-1.5 pt-1.5">
        <button
          onClick={onToggleClustering}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] rounded transition-all",
            clusteringEnabled 
              ? "bg-primary/10 text-primary" 
              : "text-slate-500 hover:bg-slate-50"
          )}
        >
          {clusteringEnabled ? <Layers size={11} /> : <MapPin size={11} />}
          <span>{clusteringEnabled ? 'Group Markers' : 'Show Individual'}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Memoized Marker Component ───────────────────────────────

const FaithMarker = React.memo(function FaithMarker({
  site,
  isHovered,
  onClick,
  onHover,
}: {
  site: LightweightFaithSite;
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
        <div className="min-w-[200px] max-w-[250px]">
          <div className="font-medium text-sm mb-1">
            {site.name}
          </div>
          
          <div 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-white mb-2"
            style={{ backgroundColor: FAITH_COLORS[site.faith] }}
          >
            <span>{FAITH_ICONS[site.faith]}</span>
            <span>{FAITH_NAMES[site.faith]}</span>
          </div>
          
          <div className="text-xs text-slate-500 mb-1">
            {site.city}{site.city && site.state ? ', ' : ''}{site.state}
          </div>
          
          <div className="text-[10px] text-slate-400">
            {site.region}
          </div>
          
          <div className="text-[10px] text-primary mt-2">
            Click for full details →
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

// ─── Main Component ───────────────────────────────────────────

export default function FaithMap({
  sites,
  hoveredId,
  selectedFaiths,
  onMarkerClick,
  onMarkerHover,
  onFaithToggle,
}: FaithMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(false); // Default: show individual markers
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // India center coordinates
  const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
  const DEFAULT_ZOOM = 5;

  // Filter sites by selected faiths
  const filteredSites = useMemo(() => {
    if (selectedFaiths.length === 0) return [];
    return sites.filter(site => selectedFaiths.includes(site.faith));
  }, [sites, selectedFaiths]);

  // Calculate counts for each faith
  const faithCounts = useMemo(() => {
    const counts: Partial<Record<FaithType, number>> = {};
    sites.forEach(site => {
      const faith = site.faith;
      counts[faith] = (counts[faith] || 0) + 1;
    });
    return counts as Record<FaithType, number>;
  }, [sites]);

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
      <FaithMarker
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
          maxClusterRadius={60}
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
        center={INDIA_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        minZoom={4}
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

      {/* Compact Filter overlay on map */}
      <div className="absolute top-3 left-3 z-[1000]">
        <FaithFilterControl
          selectedFaiths={selectedFaiths}
          onToggle={() => {}}
          onFaithToggle={onFaithToggle}
          counts={faithCounts}
          clusteringEnabled={clusteringEnabled}
          onToggleClustering={toggleClustering}
        />
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-2.5 py-1.5">
        <div className="text-xs font-medium text-slate-700">
          {filteredSites.length.toLocaleString()} sites
        </div>
        <div className="text-[10px] text-slate-400">
          {clusteringEnabled ? 'Grouped' : 'Individual'} view
        </div>
      </div>

    </div>
  );
}
