import osmnx as ox
import networkx as nx
import math
from queue import PriorityQueue
import matplotlib.pyplot as plt

class AStarPathfinder:
    def __init__(self, location="Delhi, India", network_type="drive"):
        """Initialize with a location and network type"""
        # Download the graph - corrected this line
        self.graph = ox.graph_from_point((28.6648675,77.298404), dist=10000, network_type=network_type)
        self.gdf_nodes = ox.graph_to_gdfs(self.graph, edges=False)
    
    def haversine(self, node1, node2):
        """Calculate Haversine distance between two nodes (great-circle distance)"""
        lat1, lon1 = self.gdf_nodes.loc[node1, ['y', 'x']]
        lat2, lon2 = self.gdf_nodes.loc[node2, ['y', 'x']]
        
        R = 6371  # Earth radius in km
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi/2)**2 + 
             math.cos(phi1)*math.cos(phi2)*math.sin(delta_lambda/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def find_path(self, start_point, end_point):
        """Find path using A* algorithm"""
        # Get nearest nodes to the input coordinates
        start_node = ox.distance.nearest_nodes(self.graph, start_point[1], start_point[0])
        end_node = ox.distance.nearest_nodes(self.graph, end_point[1], end_point[0])
        
        # A* algorithm implementation
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
                return path
            
            for neighbor in self.graph.neighbors(current):
                # Calculate tentative g_score
                edge_data = self.graph.get_edge_data(current, neighbor)[0]
                tentative_g_score = g_score[current] + edge_data['length']/1000  # convert to km
                
                if tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + self.haversine(neighbor, end_node)
                    if neighbor not in open_set_hash:
                        open_set.put((f_score[neighbor], neighbor))
                        open_set_hash.add(neighbor)
        
        return None  # No path found
    
    def visualize_path(self, path):
        """Visualize the path on the map"""
        if not path:
            print("No path found!")
            return
            
        # Plot the graph
        fig, ax = ox.plot_graph(self.graph, show=False, close=False, node_size=0)
        
        # Plot the path
        ox.plot.plot_graph_route(self.graph, path, route_linewidth=6, 
                               node_size=0, bgcolor='w', route_color='r', ax=ax)
        plt.show()

# Example usage
if __name__ == "__main__":
    # Create pathfinder instance
    pathfinder = AStarPathfinder()
    
    # Define start and end points (latitude, longitude)
    start_point = (28.6648675,77.298404)  # Near India Gate
    end_point = (28.6085551,77.055937)  # Nearby location
    
    # Find path
    path = pathfinder.find_path(start_point, end_point)
    
    if path:
        print(f"Path found with {len(path)} nodes")
        # Visualize the path
        pathfinder.visualize_path(path)
    else:
        print("No path found between the specified points")