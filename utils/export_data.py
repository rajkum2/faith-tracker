#!/usr/bin/env python3
"""
Data Export Utilities for Faith Tracker
Export data in various formats (CSV, GeoJSON, KML)
"""

import json
import csv
import argparse
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class DataExporter:
    """Export faith site data in various formats"""
    
    def __init__(self, data_dir: str = "public/data/faith-tracker/faith-sites"):
        self.data_dir = Path(data_dir)
        self.output_dir = Path("data/exports")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def load_sites(self, filename: str = "osm_all.json") -> List[Dict]:
        """Load sites from JSON file"""
        filepath = self.data_dir / filename
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, dict):
            return data.get('sites', [])
        return data
    
    def export_csv(self, sites: List[Dict], output_file: str = "faith_sites.csv") -> str:
        """Export sites to CSV format"""
        output_path = self.output_dir / output_file
        
        if not sites:
            print("No sites to export")
            return ""
        
        # Flatten site data for CSV
        flat_sites = []
        for site in sites:
            flat_site = self._flatten_site(site)
            flat_sites.append(flat_site)
        
        # Get all possible fields
        all_fields = set()
        for site in flat_sites:
            all_fields.update(site.keys())
        
        # Prioritize important fields
        priority_fields = [
            'id', 'name', 'faith', 'lat', 'lng', 
            'city', 'state', 'region', 'address',
            'osm_id', 'osm_url', 'is_active'
        ]
        
        fieldnames = [f for f in priority_fields if f in all_fields]
        fieldnames.extend([f for f in sorted(all_fields) if f not in priority_fields])
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(flat_sites)
        
        print(f"✅ Exported {len(sites)} sites to CSV: {output_path}")
        return str(output_path)
    
    def export_geojson(self, sites: List[Dict], output_file: str = "faith_sites.geojson") -> str:
        """Export sites to GeoJSON format"""
        output_path = self.output_dir / output_file
        
        features = []
        for site in sites:
            feature = self._site_to_geojson_feature(site)
            if feature:
                features.append(feature)
        
        geojson = {
            "type": "FeatureCollection",
            "metadata": {
                "generated": datetime.now().isoformat(),
                "count": len(features),
                "description": "Places of worship across India"
            },
            "features": features
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"✅ Exported {len(features)} sites to GeoJSON: {output_path}")
        return str(output_path)
    
    def export_kml(self, sites: List[Dict], output_file: str = "faith_sites.kml") -> str:
        """Export sites to KML format for Google Earth"""
        output_path = self.output_dir / output_file
        
        kml_header = '''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
    <name>Faith Tracker - Places of Worship</name>
    <description>{} sites across India</description>
'''.format(len(sites))
        
        kml_footer = '</Document>\n</kml>'
        
        # Faith colors for KML
        faith_colors = {
            'hinduism': 'ff6b35',      # Orange
            'islam': '27ae60',          # Green
            'christianity': '4a90e2',   # Blue
            'sikhism': 'f39c12',        # Gold
            'buddhism': '9b59b6',       # Purple
            'jainism': 'e74c3c',        # Red
        }
        
        placemarks = []
        for site in sites:
            pm = self._site_to_kml_placemark(site, faith_colors)
            if pm:
                placemarks.append(pm)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(kml_header)
            f.write('\n'.join(placemarks))
            f.write(kml_footer)
        
        print(f"✅ Exported {len(placemarks)} sites to KML: {output_path}")
        return str(output_path)
    
    def export_by_faith(self, sites: List[Dict]) -> Dict[str, str]:
        """Export separate files for each faith"""
        faith_groups = {}
        
        for site in sites:
            faith = site.get('faith', 'unknown')
            if isinstance(faith, dict):
                faith = faith.get('primary', 'unknown')
            
            if faith not in faith_groups:
                faith_groups[faith] = []
            faith_groups[faith].append(site)
        
        exported_files = {}
        for faith, faith_sites in faith_groups.items():
            filename = f"faith_sites_{faith}.csv"
            path = self.export_csv(faith_sites, filename)
            exported_files[faith] = path
        
        return exported_files
    
    def _flatten_site(self, site: Dict) -> Dict:
        """Flatten nested site structure for CSV export"""
        flat = {}
        
        # Basic fields
        flat['id'] = site.get('id', '')
        flat['osm_id'] = site.get('osm_id', '')
        flat['osm_url'] = site.get('osm_url', '')
        
        # Name handling
        name = site.get('name', {})
        if isinstance(name, dict):
            flat['name'] = name.get('english') or name.get('local') or ''
        else:
            flat['name'] = name
        
        # Coordinates
        coords = site.get('coordinates', {})
        if isinstance(coords, dict):
            flat['lat'] = coords.get('lat', '')
            flat['lng'] = coords.get('lng', '')
        else:
            flat['lat'] = site.get('lat', '')
            flat['lng'] = site.get('lng', '')
        
        # Faith
        faith = site.get('faith', {})
        if isinstance(faith, dict):
            flat['faith'] = faith.get('primary', '')
            flat['denomination'] = faith.get('denomination', '')
        else:
            flat['faith'] = faith
        
        # Location
        location = site.get('location', {})
        if isinstance(location, dict):
            flat['address'] = location.get('address', '')
            flat['city'] = location.get('city', '')
            flat['state'] = location.get('state', '')
            flat['region'] = location.get('region', '')
        else:
            flat['city'] = site.get('city', '')
            flat['state'] = site.get('state', '')
            flat['region'] = site.get('region', '')
        
        # Status
        living = site.get('living_site', {})
        if isinstance(living, dict):
            flat['is_active'] = living.get('is_active', '')
        
        # Data quality
        quality = site.get('data_quality', {})
        if isinstance(quality, dict):
            flat['completeness_score'] = quality.get('completeness_score', '')
        
        return flat
    
    def _site_to_geojson_feature(self, site: Dict) -> Dict:
        """Convert site to GeoJSON Feature"""
        # Get coordinates
        lat = None
        lng = None
        
        coords = site.get('coordinates', {})
        if isinstance(coords, dict):
            lat = coords.get('lat')
            lng = coords.get('lng')
        else:
            lat = site.get('lat')
            lng = site.get('lng')
        
        if lat is None or lng is None:
            return None
        
        # Get name
        name = site.get('name', {})
        if isinstance(name, dict):
            name = name.get('english') or name.get('local') or 'Unnamed'
        else:
            name = name or 'Unnamed'
        
        # Get faith
        faith = site.get('faith', {})
        if isinstance(faith, dict):
            faith = faith.get('primary', 'unknown')
        else:
            faith = faith or 'unknown'
        
        # Get location
        location = site.get('location', {})
        if isinstance(location, dict):
            city = location.get('city', '')
            state = location.get('state', '')
            region = location.get('region', '')
        else:
            city = site.get('city', '')
            state = site.get('state', '')
            region = site.get('region', '')
        
        return {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "id": site.get('id', ''),
                "name": name,
                "faith": faith,
                "city": city,
                "state": state,
                "region": region,
                "osm_url": site.get('osm_url', '')
            }
        }
    
    def _site_to_kml_placemark(self, site: Dict, faith_colors: Dict) -> str:
        """Convert site to KML Placemark"""
        # Get coordinates
        lat = None
        lng = None
        
        coords = site.get('coordinates', {})
        if isinstance(coords, dict):
            lat = coords.get('lat')
            lng = coords.get('lng')
        else:
            lat = site.get('lat')
            lng = site.get('lng')
        
        if lat is None or lng is None:
            return ''
        
        # Get name
        name = site.get('name', {})
        if isinstance(name, dict):
            name = name.get('english') or name.get('local') or 'Unnamed'
        else:
            name = name or 'Unnamed'
        
        # Get faith
        faith = site.get('faith', {})
        if isinstance(faith, dict):
            faith = faith.get('primary', 'unknown')
        else:
            faith = faith or 'unknown'
        
        # Get location
        location = site.get('location', {})
        if isinstance(location, dict):
            city = location.get('city', '')
            state = location.get('state', '')
        else:
            city = site.get('city', '')
            state = site.get('state', '')
        
        color = faith_colors.get(faith, 'gray')
        
        description = f"Faith: {faith.title()}"
        if city:
            description += f"<br/>City: {city}"
        if state:
            description += f"<br/>State: {state}"
        
        return f'''
    <Placemark>
        <name>{name}</name>
        <description>{description}</description>
        <Style>
            <IconStyle>
                <color>ff{color}</color>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
                </Icon>
            </IconStyle>
        </Style>
        <Point>
            <coordinates>{lng},{lat},0</coordinates>
        </Point>
    </Placemark>'''


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Export Faith Tracker data')
    parser.add_argument('--format', choices=['csv', 'geojson', 'kml', 'all'], 
                       default='all', help='Export format')
    parser.add_argument('--input', default='osm_all.json', 
                       help='Input JSON file')
    parser.add_argument('--split-by-faith', action='store_true',
                       help='Export separate files for each faith')
    
    args = parser.parse_args()
    
    exporter = DataExporter()
    
    print(f"📥 Loading sites from {args.input}...")
    sites = exporter.load_sites(args.input)
    print(f"✅ Loaded {len(sites)} sites")
    
    if args.split_by_faith:
        print("\n📁 Exporting by faith...")
        exported = exporter.export_by_faith(sites)
        print(f"✅ Exported {len(exported)} faith groups")
    
    if args.format in ['csv', 'all']:
        print("\n📄 Exporting to CSV...")
        exporter.export_csv(sites)
    
    if args.format in ['geojson', 'all']:
        print("\n🗺️  Exporting to GeoJSON...")
        exporter.export_geojson(sites)
    
    if args.format in ['kml', 'all']:
        print("\n🌍 Exporting to KML...")
        exporter.export_kml(sites)
    
    print("\n✨ Export complete!")


if __name__ == "__main__":
    main()
