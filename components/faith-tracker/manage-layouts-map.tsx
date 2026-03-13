'use client';

import React from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import type { LayoutFeature, LineFeature, GeoFeatureCollection } from '@/lib/data/types/faith-tracker';
import 'leaflet/dist/leaflet.css';

interface ManageLayoutsMapProps {
  layouts?: GeoFeatureCollection<LayoutFeature>;
  lines?: GeoFeatureCollection<LineFeature>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ManageLayoutsMap({ layouts, lines }: ManageLayoutsMapProps) {
  return (
    <MapContainer
      className="w-full h-full"
      center={[17.361, 78.745]}
      zoom={10}
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

      {layouts && layouts.features.length > 0 && (
        <GeoJSON
          key={`layouts-${layouts.features.length}`}
          {...{
            data: layouts,
            style: (feature: unknown) => {
              const f = feature as LayoutFeature;
              return {
                fillColor: f.properties.color,
                fillOpacity: 0.6,
                color: f.properties.color,
                opacity: 1,
                weight: 2,
              };
            },
            onEachFeature: (feature: unknown, layer: any) => {
              const f = feature as LayoutFeature;
              const p = f.properties;
              layer.bindPopup(
                `<div style="min-width:160px">
                  <b>${p.title}</b><br/>
                  <small>${p.category} &middot; ${p.featureType}</small><br/>
                  <small>Area: ${p.area} acres</small><br/>
                  ${p.total > 0 ? `<small>Units: ${p.available}/${p.total} available</small>` : ''}
                </div>`
              );
            },
          } as any}
        />
      )}

      {lines && lines.features.length > 0 && (
        <GeoJSON
          key={`lines-${lines.features.length}`}
          {...{
            data: lines,
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
                `<div>
                  <b>${f.properties.name}</b><br/>
                  <small>${f.properties.description}</small><br/>
                  <small>Length: ${f.properties.length} km</small>
                </div>`
              );
            },
          } as any}
        />
      )}
    </MapContainer>
  );
}
