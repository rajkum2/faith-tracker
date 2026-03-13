'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────

export interface ImageOverlayConfig {
  id: string;
  url: string;
  topLeft: [number, number];
  topRight: [number, number];
  bottomLeft: [number, number];
  opacity: number;
  label?: string;
}

interface ImageOverlayMapProps {
  overlays: ImageOverlayConfig[];
  onOverlayChange?: (overlay: ImageOverlayConfig) => void;
  editable?: boolean;
  center?: [number, number];
  zoom?: number;
}

// ─── Overlay Layer Manager ────────────────────────────────────

function OverlayManager({
  overlays,
  onOverlayChange,
  editable = false,
}: {
  overlays: ImageOverlayConfig[];
  onOverlayChange?: (overlay: ImageOverlayConfig) => void;
  editable?: boolean;
}) {
  const map = useMap();
  const layersRef = useRef<Record<string, any>>({});
  const markersRef = useRef<Record<string, L.Marker[]>>({});

  const updateOverlay = useCallback((id: string, topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number]) => {
    const overlay = overlays.find(o => o.id === id);
    if (overlay && onOverlayChange) {
      onOverlayChange({ ...overlay, topLeft, topRight, bottomLeft });
    }
  }, [overlays, onOverlayChange]);

  useEffect(() => {
    // Clean up old layers
    Object.keys(layersRef.current).forEach(id => {
      if (!overlays.find(o => o.id === id)) {
        map.removeLayer(layersRef.current[id]);
        delete layersRef.current[id];
        if (markersRef.current[id]) {
          markersRef.current[id].forEach(m => map.removeLayer(m));
          delete markersRef.current[id];
        }
      }
    });

    overlays.forEach(overlay => {
      // Remove existing layer for this overlay to re-add with updated positions
      if (layersRef.current[overlay.id]) {
        map.removeLayer(layersRef.current[overlay.id]);
      }
      if (markersRef.current[overlay.id]) {
        markersRef.current[overlay.id].forEach(m => map.removeLayer(m));
      }

      // Create image overlay using L.imageOverlay with bounds
      // For rotated overlays, we use a 3-point approach with L.imageOverlay.rotated if available
      // Fallback to standard bounds-based overlay
      const bounds = L.latLngBounds(
        L.latLng(overlay.bottomLeft[0], overlay.bottomLeft[1]),
        L.latLng(
          overlay.topRight[0],
          overlay.topRight[1]
        )
      );

      const imgOverlay = L.imageOverlay(overlay.url, bounds, {
        opacity: overlay.opacity,
        interactive: editable,
      });

      imgOverlay.addTo(map);
      layersRef.current[overlay.id] = imgOverlay;

      // Add draggable control markers if editable
      if (editable) {
        const controlIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:move"></div>`,
          className: 'overlay-control-icon',
          iconSize: L.point(12, 12),
          iconAnchor: L.point(6, 6),
        });

        const corners: { pos: [number, number]; key: 'topLeft' | 'topRight' | 'bottomLeft' }[] = [
          { pos: overlay.topLeft, key: 'topLeft' },
          { pos: overlay.topRight, key: 'topRight' },
          { pos: overlay.bottomLeft, key: 'bottomLeft' },
        ];

        const markers = corners.map(corner => {
          const marker = L.marker(L.latLng(corner.pos[0], corner.pos[1]), {
            icon: controlIcon,
            draggable: true,
          });

          marker.on('dragend', () => {
            const newPos = marker.getLatLng();
            const pts = {
              topLeft: overlay.topLeft,
              topRight: overlay.topRight,
              bottomLeft: overlay.bottomLeft,
            };
            pts[corner.key] = [newPos.lat, newPos.lng];

            // Update the overlay bounds
            const newBounds = L.latLngBounds(
              L.latLng(pts.bottomLeft[0], pts.bottomLeft[1]),
              L.latLng(pts.topRight[0], pts.topRight[1])
            );
            imgOverlay.setBounds(newBounds);

            updateOverlay(overlay.id, pts.topLeft, pts.topRight, pts.bottomLeft);
          });

          marker.addTo(map);
          return marker;
        });

        markersRef.current[overlay.id] = markers;
      }
    });

    return () => {
      Object.values(layersRef.current).forEach(layer => map.removeLayer(layer));
      Object.values(markersRef.current).forEach(markers => markers.forEach(m => map.removeLayer(m)));
      layersRef.current = {};
      markersRef.current = {};
    };
  }, [map, overlays, editable, updateOverlay]);

  return null;
}

// ─── Component ────────────────────────────────────────────────

export default function ImageOverlayMap({
  overlays,
  onOverlayChange,
  editable = false,
  center = [17.385, 78.4867],
  zoom = 13,
}: ImageOverlayMapProps) {
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

      <OverlayManager
        overlays={overlays}
        onOverlayChange={onOverlayChange}
        editable={editable}
      />
    </MapContainer>
  );
}
