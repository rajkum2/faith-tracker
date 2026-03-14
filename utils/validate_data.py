#!/usr/bin/env python3
"""
Data Validation Script for Faith Tracker
Validates JSON data files for completeness and consistency.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass
from collections import Counter

@dataclass
class ValidationResult:
    """Result of validation check"""
    file: str
    total_sites: int
    valid_sites: int
    issues: List[Dict[str, Any]]
    faith_distribution: Dict[str, int]
    region_distribution: Dict[str, int]
    completeness_score: float

class DataValidator:
    """Validates faith site data files"""
    
    FAITH_TYPES = {'hinduism', 'islam', 'christianity', 'sikhism', 
                   'buddhism', 'jainism', 'judaism', 'zoroastrianism', 
                   'bahai', 'indigenous', 'unknown'}
    
    REGIONS = {'North India', 'South India', 'East India', 
               'West India', 'Central India', 'Northeast India'}
    
    REQUIRED_FIELDS = {'id', 'name', 'lat', 'lng', 'faith'}
    
    def __init__(self, data_dir: str = "public/data/faith-tracker/faith-sites"):
        self.data_dir = Path(data_dir)
        self.results: List[ValidationResult] = []
    
    def validate_file(self, filename: str) -> ValidationResult:
        """Validate a single JSON data file"""
        filepath = self.data_dir / filename
        issues = []
        
        if not filepath.exists():
            return ValidationResult(
                file=filename,
                total_sites=0,
                valid_sites=0,
                issues=[{"error": "File not found"}],
                faith_distribution={},
                region_distribution={},
                completeness_score=0.0
            )
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            return ValidationResult(
                file=filename,
                total_sites=0,
                valid_sites=0,
                issues=[{"error": f"Invalid JSON: {e}"}],
                faith_distribution={},
                region_distribution={},
                completeness_score=0.0
            )
        
        # Handle different data structures
        if isinstance(data, dict):
            sites = data.get('sites', [])
            total = data.get('count', len(sites))
        elif isinstance(data, list):
            sites = data
            total = len(sites)
        else:
            return ValidationResult(
                file=filename,
                total_sites=0,
                valid_sites=0,
                issues=[{"error": "Invalid data structure"}],
                faith_distribution={},
                region_distribution={},
                completeness_score=0.0
            )
        
        # Validate each site
        valid_count = 0
        faith_counts = Counter()
        region_counts = Counter()
        completeness_scores = []
        
        for idx, site in enumerate(sites):
            site_issues = self._validate_site(site, idx)
            issues.extend(site_issues)
            
            if not site_issues:
                valid_count += 1
            
            # Track distributions - handle both structures
            faith = site.get('faith', 'unknown')
            if isinstance(faith, dict):
                faith = faith.get('primary', 'unknown')
            faith = faith if isinstance(faith, str) else 'unknown'
            faith_counts[faith] += 1
            
            region = site.get('region', 'Unknown')
            if isinstance(region, dict):
                region = region.get('region', 'Unknown')
            region = region if isinstance(region, str) else 'Unknown'
            
            # Handle nested location
            if region == 'Unknown' and 'location' in site:
                loc = site.get('location', {})
                if isinstance(loc, dict):
                    region = loc.get('region', 'Unknown')
            region_counts[region] += 1
            
            # Calculate completeness
            completeness = self._calculate_completeness(site)
            completeness_scores.append(completeness)
        
        avg_completeness = sum(completeness_scores) / len(completeness_scores) if completeness_scores else 0
        
        return ValidationResult(
            file=filename,
            total_sites=total,
            valid_sites=valid_count,
            issues=issues[:100],  # Limit issues
            faith_distribution=dict(faith_counts),
            region_distribution=dict(region_counts),
            completeness_score=round(avg_completeness, 2)
        )
    
    def _validate_site(self, site: Dict, index: int) -> List[Dict]:
        """Validate a single site entry"""
        issues = []
        
        # Handle both lightweight and full data structures
        # Lightweight: flat structure with lat, lng, faith (string)
        # Full: nested structure with coordinates.lat, coordinates.lng, faith.primary
        
        # Check ID
        if not site.get('id'):
            issues.append({
                "index": index,
                "field": "id",
                "error": "Missing ID"
            })
        
        site_id = site.get('id', f'index-{index}')
        
        # Check name (could be string or object)
        name = site.get('name')
        if isinstance(name, dict):
            name = name.get('english') or name.get('local')
        if not name:
            issues.append({
                "index": index,
                "id": site_id,
                "field": "name",
                "error": "Missing name"
            })
        
        # Check coordinates
        lat = site.get('lat')
        lng = site.get('lng')
        
        # Handle nested coordinates
        if lat is None and 'coordinates' in site:
            coords = site.get('coordinates', {})
            if isinstance(coords, dict):
                lat = coords.get('lat')
                lng = coords.get('lng')
        
        if lat is None:
            issues.append({
                "index": index,
                "id": site_id,
                "field": "lat",
                "error": "Missing latitude"
            })
        elif not isinstance(lat, (int, float)):
            issues.append({
                "index": index,
                "id": site_id,
                "field": "lat",
                "error": f"Invalid latitude type: {type(lat)}"
            })
        elif not (-90 <= lat <= 90):
            issues.append({
                "index": index,
                "id": site_id,
                "field": "lat",
                "error": f"Latitude out of range: {lat}"
            })
        
        if lng is None:
            issues.append({
                "index": index,
                "id": site_id,
                "field": "lng",
                "error": "Missing longitude"
            })
        elif not isinstance(lng, (int, float)):
            issues.append({
                "index": index,
                "id": site_id,
                "field": "lng",
                "error": f"Invalid longitude type: {type(lng)}"
            })
        elif not (-180 <= lng <= 180):
            issues.append({
                "index": index,
                "id": site_id,
                "field": "lng",
                "error": f"Longitude out of range: {lng}"
            })
        
        # Validate faith type
        faith = site.get('faith')
        # Handle nested faith structure
        if isinstance(faith, dict):
            faith = faith.get('primary')
        
        if faith and isinstance(faith, str) and faith not in self.FAITH_TYPES:
            issues.append({
                "index": index,
                "id": site_id,
                "field": "faith",
                "error": f"Invalid faith type: {faith}"
            })
        
        return issues
    
    def _calculate_completeness(self, site: Dict) -> float:
        """Calculate data completeness score for a site"""
        score = 0
        total = 6  # name, faith, coordinates, city, state, region
        
        # Check name
        name = site.get('name')
        if isinstance(name, dict):
            if name.get('english') or name.get('local'):
                score += 1
        elif name:
            score += 1
        
        # Check faith
        faith = site.get('faith')
        if isinstance(faith, dict):
            if faith.get('primary'):
                score += 1
        elif faith:
            score += 1
        
        # Check coordinates
        if site.get('lat') is not None or (
            'coordinates' in site and 
            isinstance(site['coordinates'], dict) and
            site['coordinates'].get('lat') is not None
        ):
            score += 1
        
        # Check location fields
        location = site.get('location', {})
        if isinstance(location, dict):
            if location.get('city'):
                score += 1
            if location.get('state'):
                score += 1
            if location.get('region'):
                score += 1
        else:
            # Flat structure
            if site.get('city'):
                score += 1
            if site.get('state'):
                score += 1
            if site.get('region'):
                score += 1
        
        return (score / total) * 100
    
    def validate_all(self) -> Dict[str, Any]:
        """Validate all data files"""
        files_to_check = [
            'osm_all.json',
            'osm_lightweight.json',
            'telangana_combined.json',
            'region_north_india.json',
            'region_south_india.json',
            'region_east_india.json',
            'region_west_india.json',
            'region_central_india.json'
        ]
        
        summary = {
            "validated_at": "",
            "files": {},
            "total_sites": 0,
            "total_valid": 0,
            "overall_completeness": 0.0,
            "faith_distribution": Counter(),
            "region_distribution": Counter()
        }
        
        all_completeness = []
        
        for filename in files_to_check:
            print(f"Validating {filename}...")
            result = self.validate_file(filename)
            self.results.append(result)
            
            summary["files"][filename] = {
                "total": result.total_sites,
                "valid": result.valid_sites,
                "issues_count": len(result.issues),
                "completeness": result.completeness_score,
                "faith_distribution": result.faith_distribution,
                "region_distribution": result.region_distribution
            }
            
            summary["total_sites"] += result.total_sites
            summary["total_valid"] += result.valid_sites
            all_completeness.append(result.completeness_score)
            
            # Aggregate distributions
            for faith, count in result.faith_distribution.items():
                summary["faith_distribution"][faith] += count
            for region, count in result.region_distribution.items():
                summary["region_distribution"][region] += count
        
        summary["overall_completeness"] = round(
            sum(all_completeness) / len(all_completeness), 2
        ) if all_completeness else 0
        
        summary["faith_distribution"] = dict(summary["faith_distribution"])
        summary["region_distribution"] = dict(summary["region_distribution"])
        
        return summary
    
    def print_report(self, summary: Dict):
        """Print validation report to console"""
        print("\n" + "="*60)
        print("FAITH TRACKER DATA VALIDATION REPORT")
        print("="*60)
        
        print(f"\n📊 OVERALL STATISTICS")
        print(f"   Total Sites: {summary['total_sites']:,}")
        print(f"   Valid Sites: {summary['total_valid']:,}")
        print(f"   Data Completeness: {summary['overall_completeness']:.1f}%")
        
        print(f"\n📁 FILE BREAKDOWN")
        for filename, data in summary["files"].items():
            status = "✅" if data["issues_count"] == 0 else "⚠️"
            print(f"   {status} {filename}")
            print(f"      Sites: {data['total']:,} | Valid: {data['valid']:,} | "
                  f"Issues: {data['issues_count']} | Completeness: {data['completeness']:.1f}%")
        
        print(f"\n🕉️ FAITH DISTRIBUTION")
        for faith, count in sorted(summary["faith_distribution"].items(), 
                                   key=lambda x: x[1], reverse=True):
            pct = (count / summary['total_sites']) * 100
            print(f"   {faith}: {count:,} ({pct:.1f}%)")
        
        print(f"\n🗺️ REGION DISTRIBUTION")
        for region, count in sorted(summary["region_distribution"].items(),
                                    key=lambda x: x[1], reverse=True):
            pct = (count / summary['total_sites']) * 100
            print(f"   {region}: {count:,} ({pct:.1f}%)")
        
        print("\n" + "="*60)
        
        # Save detailed report
        report_path = self.data_dir / "validation_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
        print(f"\n📄 Detailed report saved to: {report_path}")


def main():
    """Main entry point"""
    validator = DataValidator()
    summary = validator.validate_all()
    validator.print_report(summary)
    
    # Exit with error code if there are issues
    has_issues = any(
        data["issues_count"] > 0 
        for data in summary["files"].values()
    )
    
    sys.exit(1 if has_issues else 0)


if __name__ == "__main__":
    main()
