import json
import math
from typing import List, Tuple, Dict, Any

def simplify_path(points: List[Tuple[float, float]], tolerance: float = 0.001) -> List[Tuple[float, float]]:
    """
    Simplify a path using the Douglas-Peucker algorithm.
    This reduces the number of points while maintaining shape accuracy.
    """
    if len(points) <= 2:
        return points

    # Find the point with the maximum distance from the line
    dmax = 0
    index = 0

    for i in range(1, len(points) - 1):
        d = perpendicular_distance(points[i], points[0], points[-1])
        if d > dmax:
            index = i
            dmax = d

    # If max distance is greater than epsilon, recursively simplify
    if dmax > tolerance:
        # Recursive call
        rec_results1 = simplify_path(points[:index + 1], tolerance)
        rec_results2 = simplify_path(points[index:], tolerance)

        # Build the result list
        return rec_results1[:-1] + rec_results2
    else:
        return [points[0], points[-1]]

def perpendicular_distance(point: Tuple[float, float],
                           line_start: Tuple[float, float],
                           line_end: Tuple[float, float]) -> float:
    """Calculate perpendicular distance from point to line."""
    x0, y0 = point
    x1, y1 = line_start
    x2, y2 = line_end

    if x1 == x2 and y1 == y2:
        return math.sqrt((x0 - x1)**2 + (y0 - y1)**2)

    return abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / \
           math.sqrt((y2 - y1)**2 + (x2 - x1)**2)

def convert_coords_to_svg_path(coordinates: List, simplification: float = 0.001) -> str:
    """Convert GeoJSON coordinates to SVG path string."""
    if not coordinates:
        return ""

    # Handle both Polygon and MultiPolygon
    if isinstance(coordinates[0][0], list):  # MultiPolygon
        paths = []
        for polygon in coordinates:
            if polygon:
                # Simplify the outer ring
                simplified = simplify_path(polygon[0], simplification)
                if len(simplified) > 2:
                    path = f"M {simplified[0][0]:.2f},{simplified[0][1]:.2f}"
                    for point in simplified[1:]:
                        path += f" L {point[0]:.2f},{point[1]:.2f}"
                    path += " Z"
                    paths.append(path)
        return " ".join(paths)
    else:  # Polygon
        # Simplify the outer ring
        simplified = simplify_path(coordinates[0], simplification)
        if len(simplified) > 2:
            path = f"M {simplified[0][0]:.2f},{simplified[0][1]:.2f}"
            for point in simplified[1:]:
                path += f" L {point[0]:.2f},{point[1]:.2f}"
            path += " Z"
            return path

    return ""

def get_bounds(coordinates: List) -> Dict[str, float]:
    """Get the bounding box of coordinates."""
    all_points = []

    # Extract all points
    if isinstance(coordinates[0][0], list):  # MultiPolygon
        for polygon in coordinates:
            for ring in polygon:
                for point in ring:
                    if isinstance(point, (list, tuple)) and len(point) >= 2:
                        all_points.append(point)
    else:  # Polygon
        for ring in coordinates:
            for point in ring:
                if isinstance(point, (list, tuple)) and len(point) >= 2:
                    all_points.append(point)

    if not all_points:
        return {"minX": 0, "minY": 0, "maxX": 0, "maxY": 0}

    xs = [p[0] for p in all_points]
    ys = [p[1] for p in all_points]

    return {
        "minX": min(xs),
        "maxX": max(xs),
        "minY": min(ys),
        "maxY": max(ys)
    }

def transform_to_viewbox(coordinates: List, target_width: float = 800, target_height: float = 1000) -> List:
    """Transform coordinates to fit within a target viewbox."""
    bounds = get_bounds(coordinates)

    # Calculate California's approximate bounds
    # Longitude: -124.5 to -114.1 (west to east)
    # Latitude: 32.5 to 42.0 (south to north)
    ca_width = 124.5 - 114.1  # ~10.4 degrees
    ca_height = 42.0 - 32.5   # ~9.5 degrees

    # Calculate scale to fit in viewbox
    scale_x = target_width / ca_width
    scale_y = target_height / ca_height

    # Use uniform scale to maintain aspect ratio
    scale = min(scale_x, scale_y) * 0.9  # 0.9 for padding

    # California specific transform
    def transform_point(point) -> Tuple[float, float]:
        if not isinstance(point, (list, tuple)) or len(point) < 2:
            return (0, 0)
        lon, lat = point[0], point[1]
        # Flip Y axis and scale
        x = (lon + 124.5) * scale
        y = (42.0 - lat) * scale
        return (x, y)

    # Transform all coordinates
    if isinstance(coordinates[0][0][0], (int, float)):  # Polygon (list of rings)
        return [[transform_point(point) for point in ring] for ring in coordinates]
    else:  # MultiPolygon (list of polygons)
        return [
            [[transform_point(point) for point in ring] for ring in polygon]
            for polygon in coordinates
        ]

def main():
    # Read the GeoJSON file
    with open('california_counties.geojson', 'r') as f:
        data = json.load(f)

    counties_data = []

    for feature in data['features']:
        props = feature['properties']
        geom = feature['geometry']

        # Get county name and ID
        county_name = props.get('name', 'Unknown')
        county_id = county_name.lower().replace(' ', '-').replace('.', '')

        # Transform coordinates to viewbox
        transformed_coords = transform_to_viewbox(geom['coordinates'])

        # Convert to SVG path with different simplification levels
        path_detailed = convert_coords_to_svg_path(transformed_coords, 0.2)  # High detail
        path_simplified = convert_coords_to_svg_path(transformed_coords, 0.5)  # Simplified

        # Calculate center point
        bounds = get_bounds(transformed_coords)
        center_x = (bounds['minX'] + bounds['maxX']) / 2
        center_y = (bounds['minY'] + bounds['maxY']) / 2

        counties_data.append({
            'id': county_id,
            'name': county_name,
            'abbrev': props.get('abbrev', ''),
            'pathDetailed': path_detailed,
            'pathSimplified': path_simplified,
            'center': [round(center_x, 1), round(center_y, 1)],
            'originalPoints': len(geom['coordinates'][0]) if geom['type'] == 'Polygon' else sum(len(p[0]) for p in geom['coordinates'])
        })

    # Sort by name
    counties_data.sort(key=lambda x: x['name'])

    # Generate TypeScript file
    typescript_output = """// Real California county boundaries from GeoJSON data
// Generated from UC Davis Library california-counties repository
// Simplified using Douglas-Peucker algorithm for performance

export interface RealCountyShape {
  id: string;
  name: string;
  abbrev: string;
  path: string;  // Simplified path for interactive map
  pathDetailed?: string;  // More detailed path for individual display
  center: [number, number];
  region?: string;
}

// Map county names to regions
const countyRegions: Record<string, string> = {
"""

    # Add region mappings (you can update these based on your data)
    regions = {
        'Alameda': 'Bay Area',
        'Alpine': 'Sierra Nevada',
        'Amador': 'Sierra Nevada',
        'Butte': 'Central Valley',
        'Calaveras': 'Sierra Nevada',
        'Colusa': 'Central Valley',
        'Contra Costa': 'Bay Area',
        'Del Norte': 'North Coast',
        'El Dorado': 'Sierra Nevada',
        'Fresno': 'Central Valley',
        'Glenn': 'Central Valley',
        'Humboldt': 'North Coast',
        'Imperial': 'Southern California',
        'Inyo': 'Sierra Nevada',
        'Kern': 'Central Valley',
        'Kings': 'Central Valley',
        'Lake': 'North Coast',
        'Lassen': 'Northern California',
        'Los Angeles': 'Southern California',
        'Madera': 'Central Valley',
        'Marin': 'Bay Area',
        'Mariposa': 'Sierra Nevada',
        'Mendocino': 'North Coast',
        'Merced': 'Central Valley',
        'Modoc': 'Northern California',
        'Mono': 'Sierra Nevada',
        'Monterey': 'Central Coast',
        'Napa': 'Bay Area',
        'Nevada': 'Sierra Nevada',
        'Orange': 'Southern California',
        'Placer': 'Sierra Nevada',
        'Plumas': 'Sierra Nevada',
        'Riverside': 'Southern California',
        'Sacramento': 'Central Valley',
        'San Benito': 'Central Coast',
        'San Bernardino': 'Southern California',
        'San Diego': 'Southern California',
        'San Francisco': 'Bay Area',
        'San Joaquin': 'Central Valley',
        'San Luis Obispo': 'Central Coast',
        'San Mateo': 'Bay Area',
        'Santa Barbara': 'Central Coast',
        'Santa Clara': 'Bay Area',
        'Santa Cruz': 'Central Coast',
        'Shasta': 'Northern California',
        'Sierra': 'Sierra Nevada',
        'Siskiyou': 'Northern California',
        'Solano': 'Bay Area',
        'Sonoma': 'Bay Area',
        'Stanislaus': 'Central Valley',
        'Sutter': 'Central Valley',
        'Tehama': 'Northern California',
        'Trinity': 'Northern California',
        'Tulare': 'Central Valley',
        'Tuolumne': 'Sierra Nevada',
        'Ventura': 'Southern California',
        'Yolo': 'Central Valley',
        'Yuba': 'Central Valley'
    }

    for county, region in regions.items():
        typescript_output += f'  "{county}": "{region}",\n'

    typescript_output += "};\n\n"
    typescript_output += "export const realCaliforniaCountyShapes: RealCountyShape[] = [\n"

    # Add county data
    for county in counties_data:
        region = regions.get(county['name'], 'Unknown')
        typescript_output += f"""  {{
    id: '{county['id']}',
    name: '{county['name']}',
    abbrev: '{county['abbrev']}',
    path: `{county['pathSimplified']}`,
    pathDetailed: `{county['pathDetailed']}`,
    center: [{county['center'][0]}, {county['center'][1]}],
    region: '{region}'
  }},
"""

    typescript_output += "];\n"

    # Write to file
    output_path = 'src/data/californiaCountyBoundaries.ts'
    with open(output_path, 'w') as f:
        f.write(typescript_output)

    print(f"Generated {output_path}")
    print(f"Total counties: {len(counties_data)}")
    print(f"Average points per county (original): {sum(c['originalPoints'] for c in counties_data) / len(counties_data):.0f}")
    print(f"Sample simplified path length: {len(counties_data[0]['pathSimplified'])} characters")

if __name__ == "__main__":
    main()