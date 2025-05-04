import osmnx as ox
import networkx as nx
import math
from queue import PriorityQueue
from flask import Flask, request, jsonify
import folium
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from flask_cors import CORS
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="osmnx.plot")

plt.ioff()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def getHaversineDistance(lat1, lon1, lat2, lon2):
    R=6371
    phi1=math.radians(lat1)
    phi2=math.radians(lat2)
    del1=math.radians(lon1)
    del2=math.radians(lon2)

    phif = (phi2-phi1)
    delf = (del2-del1)
    a=math.sin(phif/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(delf/2)**2
    c=2*math.atan2(math.sqrt(a),math.sqrt(1-a))
    return R*c


class AStarPathfinder:
    def __init__(self, dist,location_point=(28.6648675, 77.298404), network_type="drive"):
        """Initialize with a location point and network type."""
        self.graph = ox.graph_from_point(location_point, dist=dist*500, network_type=network_type)
        self.gdf_nodes = ox.graph_to_gdfs(self.graph, edges=False)
    
    def haversine(self, node1, node2):
        """Calculate Haversine distance between two nodes (in km)."""
        lat1, lon1 = self.gdf_nodes.loc[node1, ['y', 'x']]
        lat2, lon2 = self.gdf_nodes.loc[node2, ['y', 'x']]
        
        R = 6371  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(delta_lambda/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    
    def find_path(self, start_point, end_point):
        """Find path using A* algorithm."""
        start_node = ox.distance.nearest_nodes(self.graph, start_point[1], start_point[0])
        end_node = ox.distance.nearest_nodes(self.graph, end_point[1], end_point[0])
        
        open_set = PriorityQueue()
        open_set.put((0, start_node))
        
        came_from = {}
        g_score = {node: float('inf') for node in self.graph.nodes()}
        g_score[start_node] = 0
        
        f_score = {node: float('inf') for node in self.graph.nodes()}
        f_score[start_node] = self.haversine(start_node, end_node)
        
        open_set_hash = {start_node}
        
        while not open_set.empty():
            current = open_set.get()[1]
            open_set_hash.remove(current)
            
            if current == end_node:
                # Reconstruct path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start_node)
                path.reverse()
                
                # Get coordinates of the path
                path_coords = []
                for node in path:
                    lat = self.gdf_nodes.loc[node, 'y']
                    lon = self.gdf_nodes.loc[node, 'x']
                    path_coords.append((lat, lon))
                
                # Calculate total distance
                total_distance = sum(
                    self.graph.edges[path[i], path[i+1], 0]['length'] / 1000  # Convert to km
                    for i in range(len(path)-1)
                )
                
                return path, path_coords, total_distance
            
            for neighbor in self.graph.neighbors(current):
                edge_data = self.graph.edges[current, neighbor, 0]
                tentative_g_score = g_score[current] + (edge_data['length'] / 1000)  # Convert to km
                
                if tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + self.haversine(neighbor, end_node)
                    if neighbor not in open_set_hash:
                        open_set.put((f_score[neighbor], neighbor))
                        open_set_hash.add(neighbor)
        
        return None, None, None  # No path found

@app.route('/api/path', methods=['POST'])
def api_path():
    data = request.get_json()
    start_lat = float(data['start_lat'])
    start_lon = float(data['start_lon'])
    end_lat = float(data['end_lat'])
    end_lon = float(data['end_lon'])
    
    center_point = ((start_lat + end_lat)/2, (start_lon + end_lon)/2)
    
    try:
        distance = getHaversineDistance(start_lat, start_lon, end_lat, end_lon)
        pathfinder = AStarPathfinder(location_point=center_point, dist=distance)
        path_nodes, path_coords, shortest_distance = pathfinder.find_path((start_lat, start_lon), (end_lat, end_lon))
        
        if not path_coords:
            return jsonify({'status': 'error', 'message': 'No path found'})
        
        # Generate Folium map
        m = folium.Map(location=center_point, zoom_start=15)
        folium.Marker([start_lat, start_lon], popup="Start", icon=folium.Icon(color='green')).add_to(m)
        folium.Marker([end_lat, end_lon], popup="End", icon=folium.Icon(color='red')).add_to(m)
        folium.PolyLine(path_coords, color='blue', weight=5, opacity=0.7).add_to(m)
        
        # Generate Matplotlib plot
        fig, ax = plt.subplots(figsize=(12,12), facecolor='black')
        ax.set_facecolor('black')
        
        ox.plot_graph(
            pathfinder.graph,
            ax=ax,
            bgcolor='black',
            node_color='white',
            edge_color='white',
            node_size=0,
            edge_linewidth=1,
            show=False,
            close=False
        )
        
        ox.plot.plot_graph_route(
            pathfinder.graph,
            path_nodes,
            ax=ax,
            route_color='red',
            route_linewidth=5,
            orig_dest_node_color='white',
            show=False,
            close=False,
            route_alpha=0.7
        )
        
        plt.tight_layout()
        
        # Save plot to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight', pad_inches=0.1, facecolor='black')
        buf.seek(0)
        plt.close(fig)
        
        return jsonify({
            'status': 'success',
            'map_html': m._repr_html_(),
            'plot_image': base64.b64encode(buf.getvalue()).decode('utf-8'),
            'path': path_coords,
            'shortest_distance_km': shortest_distance
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True, port=5001)