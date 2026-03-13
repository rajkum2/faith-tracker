'use client';

import React from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import type { LayoutFeature } from '@/lib/data/types/faith-tracker';
import 'leaflet/dist/leaflet.css';

interface ProjectsMapProps {
  projects: LayoutFeature[];
  onProjectClick: (project: LayoutFeature) => void;
}

export default function ProjectsMap({ projects, onProjectClick }: ProjectsMapProps) {
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: projects,
  };

  return (
    <MapContainer
      className="w-full h-full"
      center={[17.385, 78.4867]}
      zoom={11}
      zoomControl={false}
      zoomDelta={1}
      zoomSnap={1}
      style={{ zIndex: 0 }}
    >
      <ZoomControl position="bottomright" />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <TileLayer
        {...{
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        } as any}
      />
      {projects.length > 0 && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <GeoJSON
          key={JSON.stringify(projects.map(p => p.properties.layoutId))}
          {...{
            data: geojsonData,
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
            onEachFeature: (feature: unknown, layer: unknown) => {
              const f = feature as LayoutFeature;
              (layer as any).bindPopup(
                `<div>
                  <b>${f.properties.title}</b><br/>
                  <span>${f.properties.name}</span><br/>
                  <small>${f.properties.category} &middot; ${f.properties.area} acres</small><br/>
                  <small>Available: ${f.properties.available} / ${f.properties.total}</small>
                </div>`
              );
              (layer as any).on('click', () => onProjectClick(f));
            },
          } as any}
        />
      )}
    </MapContainer>
  );
}
