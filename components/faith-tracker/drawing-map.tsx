'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import type { LayoutFeature, LineFeature, LandFeature, GeoFeatureCollection } from '@/lib/data/types/faith-tracker';
import 'leaflet/dist/leaflet.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────

export type DrawMode = 'polygon' | 'line' | 'none';

export interface DrawnFeature {
  type: 'polygon' | 'line';
  coordinates: number[][] | number[][][];
}

interface DrawingMapProps {
  mode: DrawMode;
  existingLayouts?: GeoFeatureCollection<LayoutFeature>;
  existingLines?: GeoFeatureCollection<LineFeature>;
  onFeatureCreated?: (feature: DrawnFeature) => void;
  onFeatureEdited?: (feature: DrawnFeature) => void;
  center?: [number, number];
  zoom?: number;
}

// ─── Geoman Integration ──────────────────────────────────────

function GeomanControls({
  mode,
  onFeatureCreated,
  onFeatureEdited,
}: {
  mode: DrawMode;
  onFeatureCreated?: (feature: DrawnFeature) => void;
  onFeatureEdited?: (feature: DrawnFeature) => void;
}) {
  const map = useMap();
  const geomanInitialized = useRef(false);

  useEffect(() => {
    if (geomanInitialized.current) return;
    // Dynamically import geoman CSS and JS
    // @ts-expect-error — CSS module import
    import('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css');
    import('@geoman-io/leaflet-geoman-free').then(() => {
      if (!(map as any).pm) return;

      // Add Geoman toolbar
      (map as any).pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircle: false,
        drawCircleMarker: false,
        drawRectangle: false,
        drawText: false,
        cutPolygon: false,
        rotateMode: false,
        drawPolygon: true,
        drawPolyline: true,
        editMode: true,
        dragMode: true,
        removalMode: true,
      });

      // Listen for created events
      map.on('pm:create', (e: any) => {
        const layer = e.layer;
        const shape = e.shape;

        if (shape === 'Polygon' || shape === 'Rectangle') {
          const latlngs = layer.getLatLngs()[0];
          const coordinates = latlngs.map((ll: any) => [ll.lng, ll.lat]);
          coordinates.push(coordinates[0]); // Close the polygon
          onFeatureCreated?.({
            type: 'polygon',
            coordinates: [coordinates],
          });
        } else if (shape === 'Line') {
          const latlngs = layer.getLatLngs();
          const coordinates = latlngs.map((ll: any) => [ll.lng, ll.lat]);
          onFeatureCreated?.({
            type: 'line',
            coordinates,
          });
        }

        // Remove the temporary drawn layer (we manage it through state)
        map.removeLayer(layer);
      });

      // Listen for edit events
      map.on('pm:edit', (e: any) => {
        const layer = e.layer;
        const geojson = layer.toGeoJSON();
        if (geojson.geometry.type === 'Polygon') {
          onFeatureEdited?.({
            type: 'polygon',
            coordinates: geojson.geometry.coordinates,
          });
        } else if (geojson.geometry.type === 'LineString') {
          onFeatureEdited?.({
            type: 'line',
            coordinates: geojson.geometry.coordinates,
          });
        }
      });

      geomanInitialized.current = true;
    });
  }, [map, onFeatureCreated, onFeatureEdited]);

  // Toggle draw mode based on prop
  useEffect(() => {
    if (!geomanInitialized.current || !(map as any).pm) return;

    // Disable all modes first
    (map as any).pm.disableDraw();

    if (mode === 'polygon') {
      (map as any).pm.enableDraw('Polygon', {
        snappable: true,
        snapDistance: 20,
        templineStyle: { color: '#3b82f6', weight: 2 },
        hintlineStyle: { color: '#3b82f6', dashArray: '5,5' },
        pathOptions: { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.3 },
      });
    } else if (mode === 'line') {
      (map as any).pm.enableDraw('Line', {
        snappable: true,
        snapDistance: 20,
        templineStyle: { color: '#f97316', weight: 3 },
        hintlineStyle: { color: '#f97316', dashArray: '5,5' },
        pathOptions: { color: '#f97316', weight: 3 },
      });
    }
  }, [mode, map]);

  return null;
}

// ─── Component ────────────────────────────────────────────────

export default function DrawingMap({
  mode,
  existingLayouts,
  existingLines,
  onFeatureCreated,
  onFeatureEdited,
  center = [17.385, 78.4867],
  zoom = 11,
}: DrawingMapProps) {
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
      <TileLayer
        {...{
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        } as any}
      />

      <GeomanControls
        mode={mode}
        onFeatureCreated={onFeatureCreated}
        onFeatureEdited={onFeatureEdited}
      />

      {/* Render existing layouts */}
      {existingLayouts && existingLayouts.features.length > 0 && (
        <GeoJSON
          key={`layouts-${existingLayouts.features.length}`}
          {...{
            data: existingLayouts,
            style: (feature: unknown) => {
              const f = feature as LayoutFeature;
              return {
                fillColor: f.properties.color,
                fillOpacity: 0.4,
                color: f.properties.color,
                opacity: 0.8,
                weight: 2,
              };
            },
            onEachFeature: (feature: unknown, layer: any) => {
              const f = feature as LayoutFeature;
              layer.bindPopup(
                `<div><b>${f.properties.title}</b><br/><small>${f.properties.category} &middot; ${f.properties.area} acres</small></div>`
              );
            },
          } as any}
        />
      )}

      {/* Render existing lines */}
      {existingLines && existingLines.features.length > 0 && (
        <GeoJSON
          key={`lines-${existingLines.features.length}`}
          {...{
            data: existingLines,
            style: (feature: unknown) => {
              const f = feature as LineFeature;
              return {
                color: f.properties.color,
                opacity: f.properties.opacity,
                weight: 3,
              };
            },
            onEachFeature: (feature: unknown, layer: any) => {
              const f = feature as LineFeature;
              layer.bindPopup(
                `<div><b>${f.properties.name}</b><br/><small>${f.properties.description}</small></div>`
              );
            },
          } as any}
        />
      )}
    </MapContainer>
  );
}
