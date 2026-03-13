'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { PropertyListing, GeoFeatureCollection, LayoutFeature, LineFeature } from '@/lib/data/types/faith-tracker';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────

interface PropertyMapProps {
  listings: PropertyListing[];
  hoveredId: number | null;
  onMarkerClick: (listing: PropertyListing) => void;
  onMarkerHover: (id: number | null) => void;
  layouts?: GeoFeatureCollection<LayoutFeature>;
  lines?: GeoFeatureCollection<LineFeature>;
  center?: [number, number];
  zoom?: number;
  useClustering?: boolean;
}

// ─── Price format ─────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price}`;
}

// ─── Custom cluster icon ─────────────────────────────────────

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 'small';
  let diameter = 30;
  if (count >= 50) { size = 'large'; diameter = 44; }
  else if (count >= 10) { size = 'medium'; diameter = 36; }

  return L.divIcon({
    html: `<div style="
      width:${diameter}px;height:${diameter}px;
      background:rgba(30,64,175,0.85);
      border:2px solid rgba(30,64,175,0.4);
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${size === 'large' ? 13 : 11}px;font-weight:600;
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(diameter, diameter),
  });
}

// ─── Custom marker icon ──────────────────────────────────────

function createPropertyIcon(listing: PropertyListing, isHovered: boolean) {
  const color = isHovered ? '#16a34a' : listing.sale ? '#16a34a' : '#2563eb';
  const size = isHovered ? 14 : 10;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 1px 3px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-property-icon',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });
}

// ─── Overlay Controls ─────────────────────────────────────────

function OverlayControls({
  layouts,
  lines,
}: {
  layouts?: GeoFeatureCollection<LayoutFeature>;
  lines?: GeoFeatureCollection<LineFeature>;
}) {
  const map = useMap();
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set());
  const layerGroupsRef = useRef<Record<string, any>>({});

  const toggleLayer = useCallback((key: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (layerGroupsRef.current[key]) {
          map.removeLayer(layerGroupsRef.current[key]);
          delete layerGroupsRef.current[key];
        }
        next.delete(key);
      } else {
        let features: unknown[] = [];
        let style: (feature: unknown) => Record<string, unknown> = () => ({});

        if (key === 'highways' && lines) {
          features = lines.features;
          style = (f: unknown) => {
            const feat = f as LineFeature;
            return { color: feat.properties.color, opacity: feat.properties.opacity, weight: 3 };
          };
        } else if (layouts) {
          const typeMap: Record<string, string> = { popular: 'Popular', upcoming: 'Upcoming', redZones: 'Red Zones' };
          const featureType = typeMap[key];
          features = layouts.features.filter(
            f => f.properties.category === 'Feature' && f.properties.featureType === featureType
          );
          style = (f: unknown) => {
            const feat = f as LayoutFeature;
            return { fillColor: feat.properties.color, fillOpacity: 0.6, color: feat.properties.color, opacity: 1, weight: 2 };
          };
        }

        if (features.length > 0) {
          const geojsonLayer = L.geoJSON(
            { type: 'FeatureCollection', features } as any,
            {
              style: style as any,
              onEachFeature: (feature: any, layer: any) => {
                const name = feature.properties?.name || '';
                layer.bindPopup(`<b>${name}</b>`);
              },
            }
          );
          geojsonLayer.addTo(map);
          layerGroupsRef.current[key] = geojsonLayer;
        }
        next.add(key);
      }
      return next;
    });
  }, [map, layouts, lines]);

  const buttons = [
    { key: 'popular', label: 'Popular', color: 'bg-green-500' },
    { key: 'upcoming', label: 'Upcoming', color: 'bg-blue-500' },
    { key: 'redZones', label: 'Red Zones', color: 'bg-red-500' },
    { key: 'highways', label: 'Highways', color: 'bg-orange-500' },
  ];

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
      {buttons.map(btn => (
        <button
          key={btn.key}
          onClick={() => toggleLayer(btn.key)}
          className={cn(
            'px-3 py-1.5 text-[11px] font-medium rounded-md shadow-sm transition-all border',
            activeLayers.has(btn.key)
              ? `${btn.color} text-white border-transparent`
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// ─── Map View Sync ────────────────────────────────────────────

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// ─── Component ────────────────────────────────────────────────

export default function PropertyMap({
  listings,
  hoveredId,
  onMarkerClick,
  onMarkerHover,
  layouts,
  lines,
  center = [17.385, 78.4867],
  zoom = 11,
  useClustering = true,
}: PropertyMapProps) {
  const renderMarkers = () =>
    listings.map(listing => (
      <Marker
        key={listing.id}
        {...{
          position: [listing.geometry.coordinates[0], listing.geometry.coordinates[1]] as [number, number],
          icon: createPropertyIcon(listing, hoveredId === listing.id),
          eventHandlers: {
            click: () => onMarkerClick(listing),
            mouseover: () => onMarkerHover(listing.id),
            mouseout: () => onMarkerHover(null),
          },
        } as any}
      >
        <Popup>
          <div className="min-w-[180px]">
            <div className="font-medium text-sm mb-1">{listing.title}</div>
            <div className="text-primary font-bold text-sm">{formatPrice(listing.monthlyprice)}{listing.rental ? '/mo' : ''}</div>
            {listing.beds > 0 && <div className="text-xs text-slate-500 mt-1">{listing.beds} bed · {listing.bathrooms} bath · {listing.area.toLocaleString()} sqft</div>}
          </div>
        </Popup>
      </Marker>
    ));

  return (
    <MapContainer
      className="w-full h-full"
      center={center}
      zoom={zoom}
      zoomControl={false}
      zoomDelta={1}
      zoomSnap={1}
      style={{ zIndex: 0 }}
    >
      <ZoomControl position="bottomright" />
      <ChangeView center={center} zoom={zoom} />

      <TileLayer
        {...{
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        } as any}
      />

      {/* Overlay controls */}
      <OverlayControls layouts={layouts} lines={lines} />

      {/* Property markers with optional clustering */}
      {useClustering ? (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {renderMarkers()}
        </MarkerClusterGroup>
      ) : (
        renderMarkers()
      )}
    </MapContainer>
  );
}
