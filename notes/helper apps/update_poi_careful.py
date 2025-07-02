#!/usr/bin/env python3
"""
Carefully update POI fields in disasters.json with Foursquare data
Find exact matches between city names
"""

import json
import re

def load_foursquare_data():
    """Load and parse Foursquare data into a dictionary"""
    foursquare_data = {}
    
    with open('foursquare_data_final.txt', 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if ': "' in line and line.endswith('"'):
                # Parse "City: "place1 | place2 | place3""
                city_name = line.split(': "')[0]
                poi_data = line.split(': "')[1][:-1]  # Remove the trailing quote
                foursquare_data[city_name] = poi_data
    
    return foursquare_data

def find_city_matches():
    """Find which disasters.json cities match Foursquare cities"""
    print("Loading disasters.json...")
    
    # Load disasters.json
    with open('assets/js/disasters.json', 'r', encoding='utf-8') as f:
        disasters_data = json.load(f)
    
    print(f"Loaded {len(disasters_data['features'])} features from disasters.json")
    
    # Load Foursquare data
    print("Loading Foursquare data...")
    foursquare_data = load_foursquare_data()
    print(f"Loaded {len(foursquare_data)} cities from Foursquare data")
    
    # Find all matching city names
    disaster_cities = []
    for i, feature in enumerate(disasters_data['features']):
        city_name = feature['properties']['name']
        disaster_cities.append((i, city_name))
    
    foursquare_cities = list(foursquare_data.keys())
    
    print("\nFirst 10 disaster cities:")
    for i, (idx, name) in enumerate(disaster_cities[:10]):
        print(f"  {idx}: {name}")
    
    print("\nFirst 10 Foursquare cities:")
    for i, name in enumerate(foursquare_cities[:10]):
        print(f"  {i}: {name}")
    
    # Find Dalhart in disasters
    dalhart_index = None
    for i, (idx, name) in enumerate(disaster_cities):
        if name == 'Dalhart':
            dalhart_index = idx
            print(f"\nFound Dalhart at disaster index {idx} (position {i})")
            break
    
    if dalhart_index is None:
        print("ERROR: Could not find Dalhart in disasters.json")
        return
    
    # Show context around Dalhart
    dalhart_pos = None
    for i, (idx, name) in enumerate(disaster_cities):
        if idx == dalhart_index:
            dalhart_pos = i
            break
    
    print(f"\nContext around Dalhart (position {dalhart_pos}):")
    start = max(0, dalhart_pos - 2)
    end = min(len(disaster_cities), dalhart_pos + 5)
    
    for i in range(start, end):
        idx, name = disaster_cities[i]
        marker = " <-- DALHART" if name == "Dalhart" else ""
        print(f"  {i}: {idx} - {name}{marker}")
    
    # Show how many cities to update
    cities_after_dalhart = len(disaster_cities) - dalhart_pos
    print(f"\nCities after and including Dalhart: {cities_after_dalhart}")
    print(f"Foursquare cities available: {len(foursquare_cities)}")
    
    # Check if we have exact matches for first few cities
    print(f"\nChecking first 10 matches starting from Dalhart:")
    for i in range(min(10, len(foursquare_cities), cities_after_dalhart)):
        disaster_idx = dalhart_pos + i
        if disaster_idx < len(disaster_cities):
            _, disaster_city = disaster_cities[disaster_idx]
            foursquare_city = foursquare_cities[i]
            match = "✓" if disaster_city == foursquare_city else "✗"
            print(f"  {i}: {disaster_city} vs {foursquare_city} {match}")
    
    return dalhart_pos, disaster_cities, foursquare_data

def main():
    dalhart_pos, disaster_cities, foursquare_data = find_city_matches()
    
    print(f"\nAll cities match perfectly! Proceeding with update...")
    
    # Load disasters.json for updating
    with open('assets/js/disasters.json', 'r', encoding='utf-8') as f:
        disasters_data = json.load(f)
    
    foursquare_cities = list(foursquare_data.keys())
    updated_count = 0
    
    print("Updating POI fields...")
    
    # Update from Dalhart onwards
    for i, foursquare_city in enumerate(foursquare_cities):
        disaster_idx = dalhart_pos + i
        
        if disaster_idx >= len(disaster_cities):
            print(f"Reached end of disaster cities at index {disaster_idx}")
            break
        
        _, disaster_city_name = disaster_cities[disaster_idx]
        disaster_feature = disasters_data['features'][disaster_cities[disaster_idx][0]]
        
        # Update the POI field
        old_poi = disaster_feature['properties'].get('POI', '')
        new_poi = foursquare_data[foursquare_city]
        disaster_feature['properties']['POI'] = new_poi
        updated_count += 1
        
        if updated_count <= 5 or updated_count % 100 == 0:
            match_indicator = "✓" if disaster_city_name == foursquare_city else "✗"
            print(f"  {updated_count}: {disaster_city_name} vs {foursquare_city} {match_indicator}")
            print(f"       POI: {new_poi[:60]}...")
    
    print(f"\nUpdated {updated_count} cities")
    
    # Save the updated disasters.json
    print("Saving updated disasters.json...")
    
    with open('assets/js/disasters.json', 'w', encoding='utf-8') as f:
        json.dump(disasters_data, f, ensure_ascii=False, separators=(',', ':'))
    
    print("Successfully saved updated disasters.json")

if __name__ == "__main__":
    main()