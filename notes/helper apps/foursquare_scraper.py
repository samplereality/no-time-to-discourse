#!/usr/bin/env python3
"""
Foursquare Places API scraper for extracting real things to do and restaurants
"""

import requests
import time
import random
import sys
import re
import json

class FoursquareScraper:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://places-api.foursquare.com/places/search?exclude_all_chains=true"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json',
            'X-Places-Api-Version': '2025-06-17'
        })
        
        # Foursquare category IDs
        # Landmarks: 4d4b7105d754a06377d81259
        # Arts & Entertainment: 4d4b7104d754a06370d81259
        # Food: 4d4b7105d754a06374d81259
        # Performing Arts: 4bf58dd8d48988d1f2931735
        # Cemetery: 4bf58dd8d48988d15c941735
        # College & University: 4d4b7105d754a06372d81259
        
    def add_article(self, place_name):
        """Add 'the' article to places that need it"""
        patterns_needing_the = [
            r'.*Museum$',
            r'.*Gallery$', 
            r'.*Theater$',
            r'.*Theatre$',
            r'.*Library$',
            r'.*Bridge$',
            r'.*Park$',
            r'.*Garden$',
            r'.*Zoo$',
            r'.*Aquarium$',
            r'.*Observatory$',
            r'.*Cathedral$',
            r'.*Church$',
            r'Historic.*District',
            r'Old.*Town',
            r'.*Waterfront$',
            r'.*Boardwalk$'
        ]
        
        for pattern in patterns_needing_the:
            if re.search(pattern, place_name, re.IGNORECASE):
                if not place_name.lower().startswith('the '):
                    return f"the {place_name}"
        
        return place_name
    
    def get_attractions(self, city, state):
        """Get attractions using Foursquare API"""
        try:
            params = {
                'near': f"{city}, {state}",
                'categories': '4d4b7104d754a06370d81259',  # Arts & Entertainment
                'limit': 10,
                'sort': 'POPULARITY'
            }
            
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            attractions = []
            
            if 'results' in data:
                for place in data['results']:
                    name = place.get('name', '')
                    if name and len(name) > 2:
                        processed_name = self.add_article(name)
                        if processed_name not in attractions:  # Check for duplicates
                            attractions.append(processed_name)
                            if len(attractions) >= 2:  # Stop when we have 2 unique attractions
                                break
            
            return attractions
            
        except Exception as e:
            print(f"Error getting attractions for {city}, {state}: {e}")
            return []
    
    def get_restaurants(self, city, state):
        """Get restaurants using Foursquare API"""
        try:
            params = {
                'near': f"{city}, {state}",
                'categories': '4d4b7105d754a06374d81259',  # Food
                'limit': 10,
                'sort': 'POPULARITY'
            }
            
        
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            restaurants = []
            
            if 'results' in data:
                for place in data['results']:
                    name = place.get('name', '')
                    if name and len(name) > 2:
                        if name not in restaurants:  # Check for duplicates
                            restaurants.append(name)
                            if len(restaurants) >= 2:  # Stop when we have 2 unique restaurants
                                break
            
            return restaurants
            
        except Exception as e:
            print(f"Error getting restaurants for {city}, {state}: {e}")
            return []
    
    def get_landmarks(self, city, state):
        """Get landmarks using Foursquare API"""
        try:
            params = {
                'near': f"{city}, {state}",
                'categories': '4d4b7105d754a06377d81259',  # Landmarks
                'limit': 10,
                'sort': 'POPULARITY'
            }
            
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            landmarks = []
            
            if 'results' in data:
                for place in data['results']:
                    name = place.get('name', '')
                    if name and len(name) > 2:
                        processed_name = self.add_article(name)
                        if processed_name not in landmarks:  # Check for duplicates
                            landmarks.append(processed_name)
                            if len(landmarks) >= 2:  # Stop when we have 2 unique landmarks
                                break
            
            return landmarks
            
        except Exception as e:
            print(f"Error getting landmarks for {city}, {state}: {e}")
            return []
    
    def get_performing_arts(self, city, state):
        """Get performing arts venues using Foursquare API"""
        try:
            params = {
                'near': f"{city}, {state}",
                'categories': '4bf58dd8d48988d1f2931735',  # Performing Arts
                'limit': 10,
                'sort': 'POPULARITY'
            }
            
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            performing_arts = []
            
            if 'results' in data:
                for place in data['results']:
                    name = place.get('name', '')
                    if name and len(name) > 2:
                        processed_name = self.add_article(name)
                        if processed_name not in performing_arts:
                            performing_arts.append(processed_name)
                            if len(performing_arts) >= 2:
                                break
            
            return performing_arts
            
        except Exception as e:
            print(f"Error getting performing arts for {city}, {state}: {e}")
            return []
    
    def get_cemeteries(self, city, state):
        """Get cemeteries using Foursquare API"""
        try:
            params = {
                'near': f"{city}, {state}",
                'categories': '4bf58dd8d48988d15c941735',  # Cemetery
                'limit': 10,
                'sort': 'POPULARITY'
            }
            
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            cemeteries = []
            
            if 'results' in data:
                for place in data['results']:
                    name = place.get('name', '')
                    if name and len(name) > 2:
                        processed_name = self.add_article(name)
                        if processed_name not in cemeteries:
                            cemeteries.append(processed_name)
                            if len(cemeteries) >= 2:
                                break
            
            return cemeteries
            
        except Exception as e:
            print(f"Error getting cemeteries for {city}, {state}: {e}")
            return []
    
    def get_colleges(self, city, state):
        """Get colleges and universities using Foursquare API"""
        try:
            params = {
                'near': f"{city}, {state}",
                'categories': '4d4b7105d754a06372d81259',  # College & University
                'limit': 10,
                'sort': 'POPULARITY'
            }
            
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            colleges = []
            
            if 'results' in data:
                for place in data['results']:
                    name = place.get('name', '')
                    if name and len(name) > 2:
                        processed_name = self.add_article(name)
                        if processed_name not in colleges:
                            colleges.append(processed_name)
                            if len(colleges) >= 2:
                                break
            
            return colleges
            
        except Exception as e:
            print(f"Error getting colleges for {city}, {state}: {e}")
            return []
    
    def process_locations_file(self, filename):
        """Process the locations.txt file and get data for each city"""
        results = []
        
        with open(filename, 'r') as f:
            locations = [line.strip() for line in f.readlines()]
        
        print(f"Processing {len(locations)} locations...")
        
        for i, location in enumerate(locations):
            if ', ' in location:
                city, state = location.split(', ', 1)
                city = city.strip()
                state = state.strip()
                
                print(f"Processing {i+1}/{len(locations)}: {city}, {state}")
                
                # Get primary categories
                attractions = self.get_attractions(city, state)
                restaurants = self.get_restaurants(city, state)
                landmarks = self.get_landmarks(city, state)
                
                # Collect all places and remove duplicates
                all_places = []
                seen_places = set()
                category_counts = {'attractions': 0, 'restaurants': 0, 'landmarks': 0, 'performing_arts': 0, 'cemeteries': 0, 'colleges': 0}
                
                # Add primary categories
                for place in attractions:
                    if place.lower() not in seen_places:
                        all_places.append(place)
                        seen_places.add(place.lower())
                        category_counts['attractions'] += 1
                
                for place in restaurants:
                    if place.lower() not in seen_places:
                        all_places.append(place)
                        seen_places.add(place.lower())
                        category_counts['restaurants'] += 1
                
                for place in landmarks:
                    if place.lower() not in seen_places:
                        all_places.append(place)
                        seen_places.add(place.lower())
                        category_counts['landmarks'] += 1
                
                # If we don't have 6 places, add backup categories
                if len(all_places) < 6:
                    # Add performing arts
                    performing_arts = self.get_performing_arts(city, state)
                    for place in performing_arts:
                        if place.lower() not in seen_places and len(all_places) < 6:
                            all_places.append(place)
                            seen_places.add(place.lower())
                            category_counts['performing_arts'] += 1
                
                if len(all_places) < 6:
                    # Add cemeteries
                    cemeteries = self.get_cemeteries(city, state)
                    for place in cemeteries:
                        if place.lower() not in seen_places and len(all_places) < 6:
                            all_places.append(place)
                            seen_places.add(place.lower())
                            category_counts['cemeteries'] += 1
                
                if len(all_places) < 6:
                    # Add colleges
                    colleges = self.get_colleges(city, state)
                    for place in colleges:
                        if place.lower() not in seen_places and len(all_places) < 6:
                            all_places.append(place)
                            seen_places.add(place.lower())
                            category_counts['colleges'] += 1
                
                if all_places:
                    places_str = " | ".join(all_places)
                    results.append(f"{city}: \"{places_str}\"")
                    
                    # Build summary of categories found
                    summary_parts = []
                    for category, count in category_counts.items():
                        if count > 0:
                            summary_parts.append(f"{count} {category}")
                    
                    print(f"  Found {len(all_places)} unique places ({', '.join(summary_parts)})")
                else:
                    print(f"  No places found")
                
                # Rate limiting - respect API limits
                time.sleep(random.uniform(0.5, 1.0))
                
                # Save progress every 50 locations
                if (i + 1) % 50 == 0:
                    self.save_results(results, f"foursquare_data_progress_{i+1}.txt")
                    print(f"Progress saved at {i+1} locations")
        
        return results
    
    def save_results(self, results, filename):
        """Save results to file"""
        with open(filename, 'w', encoding='utf-8') as f:
            for result in results:
                f.write(result + '\n')
        print(f"Saved {len(results)} results to {filename}")

def main():
    if len(sys.argv) < 3:
        print("Usage: python foursquare_scraper.py <API_KEY> locations.txt")
        print("Example: python foursquare_scraper.py 'your_api_key_here' locations.txt")
        sys.exit(1)
    
    api_key = sys.argv[1]
    locations_file = sys.argv[2]
    
    scraper = FoursquareScraper(api_key)
    results = scraper.process_locations_file(locations_file)
    
    # Save final results
    scraper.save_results(results, "foursquare_data_final.txt")
    print("Foursquare scraping completed!")

if __name__ == "__main__":
    main()