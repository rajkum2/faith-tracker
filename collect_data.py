"""
Faith Atlas India — Local Data Collector
==========================================
Run this on YOUR machine with your Google API key.
Collects temples, mosques, and churches across all of India.

SETUP (one time):
    pip install requests python-dotenv tqdm

CREATE .env file in same folder:
    GOOGLE_API_KEY=your_key_here

RUN:
    python3 collect_local.py --osm          ← FREE, start here (200k+ sites)
    python3 collect_local.py --google       ← Needs API key, enriches top sites
    python3 collect_local.py --all          ← Both (recommended)
    python3 collect_local.py --state="Tamil Nadu" --category=temple
    python3 collect_local.py --stats        ← Show collected data stats
"""

import os
import json
import time
import csv
import argparse
from datetime import date
from pathlib import Path

try:
    import requests
    from tqdm import tqdm
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Installing required packages...")
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install",
                           "requests", "tqdm", "python-dotenv"])
    import requests
    from tqdm import tqdm
    from dotenv import load_dotenv
    load_dotenv()

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
RAW_DIR   = Path("data/raw");    RAW_DIR.mkdir(parents=True, exist_ok=True)
PROC_DIR  = Path("data/processed"); PROC_DIR.mkdir(parents=True, exist_ok=True)
EXP_DIR   = Path("data/exports");   EXP_DIR.mkdir(parents=True, exist_ok=True)

INDIA_BOUNDS = dict(south=6.7, north=37.1, west=68.1, east=97.4)

GOOGLE_DELAY   = 0.25   # seconds between requests
OSM_TIMEOUT    = 180    # seconds for OSM bulk query

# ─────────────────────────────────────────────
# INDIA STATES (tier-ordered)
# ─────────────────────────────────────────────
STATES = [
    # Tier 1 — highest density
    ("Tamil Nadu",        "TN", "South India"),
    ("Uttar Pradesh",     "UP", "North India"),
    ("Rajasthan",         "RJ", "West India"),
    ("Maharashtra",       "MH", "West India"),
    ("Gujarat",           "GJ", "West India"),
    # Tier 2
    ("Karnataka",         "KA", "South India"),
    ("Andhra Pradesh",    "AP", "South India"),
    ("Telangana",         "TS", "South India"),
    ("West Bengal",       "WB", "East India"),
    ("Odisha",            "OD", "East India"),
    ("Kerala",            "KL", "South India"),
    ("Madhya Pradesh",    "MP", "Central India"),
    ("Bihar",             "BR", "East India"),
    # Tier 3
    ("Punjab",            "PB", "North India"),
    ("Himachal Pradesh",  "HP", "North India"),
    ("Uttarakhand",       "UK", "North India"),
    ("Goa",               "GA", "West India"),
    ("Delhi",             "DL", "North India"),
    # Tier 4
    ("Assam",             "AS", "Northeast India"),
    ("Jharkhand",         "JH", "East India"),
    ("Chhattisgarh",      "CG", "Central India"),
    ("Haryana",           "HR", "North India"),
    ("Jammu & Kashmir",   "JK", "North India"),
    ("Manipur",           "MN", "Northeast India"),
    ("Meghalaya",         "ML", "Northeast India"),
    ("Nagaland",          "NL", "Northeast India"),
    ("Tripura",           "TR", "Northeast India"),
    ("Arunachal Pradesh", "AR", "Northeast India"),
    ("Mizoram",           "MZ", "Northeast India"),
    ("Sikkim",            "SK", "Northeast India"),
]

# ─────────────────────────────────────────────
# QUERY TEMPLATES PER CATEGORY
# ─────────────────────────────────────────────
QUERIES = {
    "temple": {
        "faith": "hinduism",
        "sub_category": "temple",
        "templates": [
            "Hindu temple {state} India",
            "Shiva temple {state} India",
            "Vishnu temple {state} India",
            "Shakti Devi temple {state} India",
            "Hanuman temple {state} India",
            "ancient temple {state} India",
            "Jyotirlinga India",
            "Shakti Peetha India",
            "Char Dham India",
            "108 Divya Desam India",
            "Swaminarayan temple {state} India",
            "ISKCON temple India",
        ]
    },
    "mosque": {
        "faith": "islam",
        "sub_category": "mosque",
        "templates": [
            "Jama Masjid {state} India",
            "mosque {state} India",
            "dargah {state} India",
            "Sufi shrine India",
            "historic mosque {state} India",
            "Mughal mosque India",
            "Eidgah {state} India",
        ]
    },
    "church": {
        "faith": "christianity",
        "sub_category": "church",
        "templates": [
            "Catholic church {state} India",
            "church {state} India",
            "cathedral {state} India",
            "basilica India",
            "CSI church {state} India",
            "Orthodox church Kerala India",
            "St Thomas church India",
        ]
    },
    "gurudwara": {
        "faith": "sikhism",
        "sub_category": "gurudwara",
        "templates": [
            "Gurudwara {state} India",
            "Gurudwara Sahib {state} India",
            "Sikh shrine India",
            "historic Gurudwara Punjab India",
        ]
    },
    "buddhist": {
        "faith": "buddhism",
        "sub_category": "monastery",
        "templates": [
            "Buddhist monastery {state} India",
            "Buddhist temple {state} India",
            "Stupa India",
            "Tibetan monastery {state} India",
        ]
    },
    "jain": {
        "faith": "jainism",
        "sub_category": "temple",
        "templates": [
            "Jain temple {state} India",
            "Jain Tirth India",
            "Derasar Gujarat India",
        ]
    },
    "ashram": {
        "faith": "hinduism",
        "sub_category": "ashram",
        "templates": [
            "ashram {state} India",
            "Sathya Sai Baba ashram India",
            "Isha Foundation India",
            "Art of Living ashram India",
            "Ramakrishna Mission {state} India",
            "yoga ashram Rishikesh India",
            "Mata Amritanandamayi ashram India",
            "Aurobindo Ashram India",
        ]
    },
}

# ─────────────────────────────────────────────
# OSM COLLECTOR — FREE, no API key needed
# ─────────────────────────────────────────────
class OSMCollector:
    URL = "https://overpass-api.de/api/interpreter"
    RELIGION_MAP = {
        "hindu": "hinduism", "muslim": "islam", "christian": "christianity",
        "sikh": "sikhism", "buddhist": "buddhism", "jain": "jainism",
        "jewish": "judaism", "zoroastrian": "zoroastrianism",
        "animist": "indigenous", "bahai": "bahai",
    }
    BUILDING_MAP = {
        "temple": "temple", "mosque": "mosque", "church": "church",
        "cathedral": "cathedral", "monastery": "monastery",
        "gurudwara": "gurudwara", "synagogue": "synagogue",
    }

    def fetch_all_india(self):
        """Single query — fetches ALL places of worship in India."""
        print("\n🌍 Fetching ALL places of worship in India from OpenStreetMap...")
        print("   This is FREE and will return 200,000+ sites.")
        print("   Please wait — this takes 2-5 minutes...\n")

        query = """
[out:json][timeout:180];
area["name"="India"]["admin_level"="2"]->.india;
(
  node["amenity"="place_of_worship"](area.india);
  way["amenity"="place_of_worship"](area.india);
  relation["amenity"="place_of_worship"](area.india);
  node["amenity"="monastery"](area.india);
  node["historic"="temple"](area.india);
  node["building"="temple"](area.india);
  node["building"="mosque"](area.india);
  node["building"="church"](area.india);
  node["building"="gurudwara"](area.india);
);
out body center;
"""
        try:
            r = requests.post(self.URL, data={"data": query}, timeout=OSM_TIMEOUT)
            r.raise_for_status()
            elements = r.json().get("elements", [])
            print(f"   ✅ OSM returned {len(elements):,} elements")
            return elements
        except requests.Timeout:
            print("   ⚠️  OSM timed out. Try fetching by state instead.")
            return []
        except Exception as e:
            print(f"   ❌ OSM error: {e}")
            return []

    def fetch_by_state(self, state_name, religion=None):
        """Fetch worship sites for a single state (faster, for testing)."""
        religion_filter = f'["religion"="{religion}"]' if religion else ''
        query = f"""
[out:json][timeout:60];
area["name"="{state_name}"]["admin_level"="4"]->.state;
(
  node["amenity"="place_of_worship"]{religion_filter}(area.state);
  way["amenity"="place_of_worship"]{religion_filter}(area.state);
);
out body center;
"""
        try:
            r = requests.post(self.URL, data={"data": query}, timeout=90)
            r.raise_for_status()
            return r.json().get("elements", [])
        except Exception as e:
            print(f"   OSM state query failed: {e}")
            return []

    def element_to_site(self, el, counter):
        """Convert raw OSM element to our site schema."""
        tags = el.get("tags", {})
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lng = el.get("lon") or el.get("center", {}).get("lon")

        # Skip elements without coordinates or names
        name = tags.get("name") or tags.get("name:en")
        if not name or not lat or not lng:
            return None

        # Map religion tag
        religion_raw = tags.get("religion", "").lower()
        faith = self.RELIGION_MAP.get(religion_raw, "unknown")
        if faith == "unknown" and "mosque" in name.lower():
            faith = "islam"
        elif faith == "unknown" and "temple" in name.lower():
            faith = "hinduism"
        elif faith == "unknown" and "church" in name.lower():
            faith = "christianity"
        elif faith == "unknown" and "gurudwara" in name.lower():
            faith = "sikhism"

        sub_cat = (tags.get("place_of_worship") or
                   self.BUILDING_MAP.get(tags.get("building", "")) or
                   "place_of_worship")

        state = tags.get("addr:state", "")
        city  = tags.get("addr:city") or tags.get("addr:town") or ""

        return {
            "id": f"fs-osm-{str(counter).zfill(7)}",
            "osm_id": f"{el['type']}/{el['id']}",
            "osm_url": f"https://www.openstreetmap.org/{el['type']}/{el['id']}",
            "name": {
                "english": name,
                "local": tags.get("name:hi") or tags.get("name:ta") or
                         tags.get("name:te") or tags.get("name:ml") or
                         tags.get("name:kn"),
                "alternate_names": list(filter(None, [tags.get("alt_name"), tags.get("old_name")])),
            },
            "coordinates": {"lat": lat, "lng": lng, "accuracy": "exact"},
            "location": {
                "address": tags.get("addr:full", ""),
                "city": city,
                "state": state,
                "region": self._infer_region(lat, lng),
            },
            "faith": {
                "primary": faith,
                "denomination": tags.get("denomination"),
                "sub_category": sub_cat,
                "osm_tags": {k: v for k, v in tags.items() if k.startswith("name") or k in ["religion","denomination","amenity","building","historic"]},
            },
            "historical": {},
            "living_site": {"is_active": True},
            "sources": [{"type": "openstreetmap", "retrieved": str(date.today())}],
            "data_quality": {
                "completeness_score": self._score(name, city, state, faith),
                "last_verified": str(date.today()),
                "needs_review": True,
                "flags": ["COMMUNITY_SUBMITTED_UNVERIFIED"],
                "version": "1.0.0",
            }
        }

    def _infer_region(self, lat, lng):
        if lat > 28: return "North India"
        if lat > 21 and lng < 78: return "West India"
        if lat > 21 and lng > 78: return "Central India"
        if lat < 21 and lng > 87: return "East India"
        if lng > 93: return "Northeast India"
        return "South India"

    def _score(self, name, city, state, faith):
        score = 30  # base for having a name + coordinates
        if city: score += 15
        if state: score += 15
        if faith != "unknown": score += 20
        return score

# ─────────────────────────────────────────────
# GOOGLE PLACES COLLECTOR
# ─────────────────────────────────────────────
class GoogleCollector:
    BASE = "https://maps.googleapis.com/maps/api"

    def __init__(self, api_key):
        self.api_key = api_key

    def text_search(self, query, page_token=None):
        """Run a text search and return results + next_page_token."""
        params = {"query": query, "key": self.api_key, "region": "in"}
        if page_token:
            params["pagetoken"] = page_token
        try:
            r = requests.get(f"{self.BASE}/place/textsearch/json", params=params, timeout=15)
            data = r.json()
            if data.get("status") == "REQUEST_DENIED":
                print(f"\n❌ Google API key rejected: {data.get('error_message')}")
                return [], None
            return data.get("results", []), data.get("next_page_token")
        except Exception as e:
            print(f"   Google text search error: {e}")
            return [], None

    def place_details(self, place_id):
        """Get full details for a place."""
        fields = ",".join([
            "place_id","name","formatted_address","geometry","types",
            "rating","user_ratings_total","website","formatted_phone_number",
            "opening_hours","editorial_summary","business_status","photos",
        ])
        try:
            r = requests.get(f"{self.BASE}/place/details/json", timeout=15,
                params={"place_id": place_id, "fields": fields, "key": self.api_key})
            return r.json().get("result", {})
        except:
            return {}

    def collect_query(self, query, max_pages=3):
        """Fetch up to 3 pages (60 results) for one query."""
        all_results, token = [], None
        for page in range(max_pages):
            results, token = self.text_search(query, token)
            all_results.extend(results)
            if not token: break
            time.sleep(2.1)  # Google requires 2s between page calls
        return all_results

    def within_india(self, place):
        """Check if coordinates fall inside India's bounding box."""
        loc = place.get("geometry", {}).get("location", {})
        lat, lng = loc.get("lat", 0), loc.get("lng", 0)
        b = INDIA_BOUNDS
        return b["south"] <= lat <= b["north"] and b["west"] <= lng <= b["east"]

    def to_site(self, place, category, state_name, state_code, region, counter):
        """Convert Google place to our schema."""
        cat = QUERIES[category]
        loc = place.get("geometry", {}).get("location", {})
        return {
            "id": f"fs-goog-{str(counter).zfill(7)}",
            "google_place_id": place.get("place_id"),
            "name": {
                "english": place.get("name", ""),
                "alternate_names": [],
            },
            "coordinates": {"lat": loc.get("lat", 0), "lng": loc.get("lng", 0), "accuracy": "exact"},
            "location": {
                "address": place.get("formatted_address", ""),
                "city": (place.get("vicinity", "") or "").split(",")[0],
                "state": state_name,
                "state_code": state_code,
                "region": region,
            },
            "faith": {
                "primary": cat["faith"],
                "sub_category": cat["sub_category"],
                "google_types": place.get("types", []),
            },
            "historical": {},
            "living_site": {
                "is_active": place.get("business_status") != "CLOSED_PERMANENTLY",
            },
            "google_data": {
                "rating": place.get("rating"),
                "total_ratings": place.get("user_ratings_total"),
                "photos_count": len(place.get("photos", [])),
                "description": (place.get("editorial_summary") or {}).get("overview"),
                "business_status": place.get("business_status"),
            },
            "sources": [{"type": "google_places", "retrieved": str(date.today())}],
            "data_quality": {
                "completeness_score": 45,
                "last_verified": str(date.today()),
                "needs_review": True,
                "flags": ["MISSING_FOUNDING_YEAR", "UNCLASSIFIED_DENOMINATION"],
                "version": "1.0.0",
            }
        }

# ─────────────────────────────────────────────
# DEDUPLICATION
# ─────────────────────────────────────────────
def deduplicate(sites):
    """Remove exact and near-duplicate sites."""
    seen_ids = set()
    seen_coords = set()
    unique = []
    for s in sites:
        gid = s.get("google_place_id") or s.get("osm_id", "")
        if gid and gid in seen_ids:
            continue
        lat = round(s["coordinates"]["lat"], 4)
        lng = round(s["coordinates"]["lng"], 4)
        grid = f"{lat},{lng}"
        if grid in seen_coords:
            continue
        if gid:
            seen_ids.add(gid)
        seen_coords.add(grid)
        unique.append(s)
    return unique

# ─────────────────────────────────────────────
# SAVE HELPERS
# ─────────────────────────────────────────────
def save_json(sites, filename, category=None):
    path = PROC_DIR / filename
    data = {"count": len(sites), "generated": str(date.today()), "sites": sites}
    if category:
        data["category"] = category
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"   💾 Saved {len(sites):,} sites → {path}")
    return path

def save_csv(sites, filename):
    """Export flat CSV for spreadsheet analysis."""
    path = EXP_DIR / filename
    rows = []
    for s in sites:
        rows.append({
            "id": s.get("id"),
            "osm_id": s.get("osm_id", ""),
            "google_place_id": s.get("google_place_id", ""),
            "name_english": s["name"]["english"],
            "name_local": s["name"].get("local", ""),
            "lat": s["coordinates"]["lat"],
            "lng": s["coordinates"]["lng"],
            "city": s["location"].get("city", ""),
            "state": s["location"].get("state", ""),
            "region": s["location"].get("region", ""),
            "faith": s["faith"]["primary"],
            "denomination": s["faith"].get("denomination", ""),
            "sub_category": s["faith"].get("sub_category", ""),
            "founding_year": s["historical"].get("founding_year", ""),
            "era": s["historical"].get("era", ""),
            "is_active": s["living_site"]["is_active"],
            "annual_visitors": s["living_site"].get("annual_pilgrims", ""),
            "rating": s.get("google_data", {}).get("rating", ""),
            "heritage": s["historical"].get("heritage_status", ""),
            "source": s["sources"][0]["type"],
            "completeness_score": s["data_quality"]["completeness_score"],
        })
    with open(path, "w", newline="", encoding="utf-8") as f:
        if rows:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
    print(f"   📊 CSV exported → {path}")

def print_stats(all_sites):
    by_faith = {}
    by_region = {}
    by_source = {}
    for s in all_sites:
        f = s["faith"]["primary"]
        r = s["location"].get("region", "Unknown")
        src = s["sources"][0]["type"]
        by_faith[f] = by_faith.get(f, 0) + 1
        by_region[r] = by_region.get(r, 0) + 1
        by_source[src] = by_source.get(src, 0) + 1

    print(f"\n{'='*55}")
    print(f"  FAITH ATLAS INDIA — COLLECTION STATS")
    print(f"{'='*55}")
    print(f"  Total sites: {len(all_sites):,}")
    print(f"\n  BY FAITH:")
    for k,v in sorted(by_faith.items(), key=lambda x: -x[1]):
        print(f"    {k:<22} {v:>6,}")
    print(f"\n  BY REGION:")
    for k,v in sorted(by_region.items(), key=lambda x: -x[1]):
        print(f"    {k:<25} {v:>6,}")
    print(f"\n  BY SOURCE:")
    for k,v in by_source.items():
        print(f"    {k:<22} {v:>6,}")
    print(f"{'='*55}\n")

# ─────────────────────────────────────────────
# MAIN RUNNERS
# ─────────────────────────────────────────────
def run_osm(args):
    """Collect all worship sites from OpenStreetMap — FREE."""
    osm = OSMCollector()

    if getattr(args, "state", None):
        print(f"\n🔎 Fetching OSM data for: {args.state}")
        elements = osm.fetch_by_state(args.state)
    else:
        elements = osm.fetch_all_india()

    if not elements:
        print("No elements returned. Check your internet connection.")
        return []

    # Save raw
    raw_path = RAW_DIR / "osm_raw.json"
    with open(raw_path, "w") as f:
        json.dump(elements, f)
    print(f"   Raw OSM data saved: {raw_path}")

    # Convert to schema
    print(f"\n⚙️  Converting {len(elements):,} elements to schema...")
    sites = []
    counter = 1
    for el in tqdm(elements, desc="Processing OSM"):
        site = osm.element_to_site(el, counter)
        if site:
            sites.append(site)
            counter += 1

    # Deduplicate
    before = len(sites)
    sites = deduplicate(sites)
    print(f"   Deduplication: {before:,} → {len(sites):,} unique sites")

    # Split by faith and save
    temples = [s for s in sites if s["faith"]["primary"] in ("hinduism","jainism","sikhism","buddhism")]
    mosques = [s for s in sites if s["faith"]["primary"] == "islam"]
    churches = [s for s in sites if s["faith"]["primary"] == "christianity"]
    others   = [s for s in sites if s["faith"]["primary"] not in ("hinduism","jainism","sikhism","buddhism","islam","christianity")]

    save_json(temples,  "osm_temples.json",  "temples")
    save_json(mosques,  "osm_mosques.json",  "mosques")
    save_json(churches, "osm_churches.json", "churches")
    save_json(others,   "osm_others.json",   "other_faiths")
    save_json(sites,    "osm_all.json",      "all")
    save_csv(sites, "osm_all.csv")

    print_stats(sites)
    return sites

def run_google(args):
    """Collect sites from Google Places API."""
    if not GOOGLE_API_KEY:
        print("\n❌ GOOGLE_API_KEY not set in .env file")
        print("   Create .env file with: GOOGLE_API_KEY=your_key_here")
        return []

    goog = GoogleCollector(GOOGLE_API_KEY)
    categories = [args.category] if getattr(args, "category", None) else list(QUERIES.keys())
    states = [(n,c,r) for n,c,r in STATES if not getattr(args,"state",None) or n==args.state]

    all_sites = []
    seen_ids = set()
    counter = 1

    print(f"\n🔍 Google Places Collection")
    print(f"   Categories: {', '.join(categories)}")
    print(f"   States: {len(states)}")

    for category in categories:
        cat_sites = []
        cat_info = QUERIES[category]

        for state_name, state_code, region in tqdm(states, desc=f"  {category}"):
            for template in cat_info["templates"]:
                query = template.replace("{state}", state_name)
                results = goog.collect_query(query)
                time.sleep(GOOGLE_DELAY)

                for place in results:
                    if not goog.within_india(place):
                        continue
                    pid = place.get("place_id", "")
                    if pid and pid in seen_ids:
                        continue
                    if pid:
                        seen_ids.add(pid)

                    site = goog.to_site(place, category, state_name, state_code, region, counter)
                    cat_sites.append(site)
                    counter += 1

        cat_sites = deduplicate(cat_sites)
        all_sites.extend(cat_sites)
        save_json(cat_sites, f"google_{category}.json", category)
        save_csv(cat_sites, f"google_{category}.csv")
        print(f"   {category}: {len(cat_sites):,} unique sites")

    save_json(all_sites, "google_all.json", "all")
    save_csv(all_sites, "google_all.csv")
    print_stats(all_sites)
    return all_sites

def run_stats(args):
    """Print stats on all collected data."""
    all_sites = []
    for f in PROC_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text())
            all_sites.extend(data.get("sites", []))
        except:
            pass
    if not all_sites:
        print("No data collected yet. Run --osm or --google first.")
    else:
        all_sites = deduplicate(all_sites)
        print_stats(all_sites)

# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Faith Atlas India — Data Collector")
    parser.add_argument("--osm",      action="store_true", help="Collect from OpenStreetMap (FREE)")
    parser.add_argument("--google",   action="store_true", help="Collect from Google Places API (needs key)")
    parser.add_argument("--all",      action="store_true", help="Run both OSM and Google")
    parser.add_argument("--stats",    action="store_true", help="Show stats on collected data")
    parser.add_argument("--state",    type=str,            help='Limit to one state: --state="Tamil Nadu"')
    parser.add_argument("--category", type=str,            help="Limit to one category: --category=temple")
    args = parser.parse_args()

    if args.stats:
        run_stats(args)
    elif args.all:
        osm_sites = run_osm(args)
        google_sites = run_google(args)
        all_sites = deduplicate(osm_sites + google_sites)
        save_json(all_sites, "combined_all.json", "all_sources")
        save_csv(all_sites, "combined_all.csv")
        print(f"\n✅ Combined total: {len(all_sites):,} unique faith sites across India")
    elif args.osm:
        run_osm(args)
    elif args.google:
        run_google(args)
    else:
        print(__doc__)
        parser.print_help()