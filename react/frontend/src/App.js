import React, { useState } from 'react';
import './App.css';

function App() {
  const [startLat, setStartLat] = useState('28.6648675');
  const [startLon, setStartLon] = useState('77.298404');
  const [endLat, setEndLat] = useState('28.653622');
  const [endLon, setEndLon] = useState('77.295733');
  const [mapHtml, setMapHtml] = useState('');
  const [plotImage, setPlotImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [distance, setDistance] = useState(null);
  const [activeTab, setActiveTab] = useState('map');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://192.168.1.38:5001/api/path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: startLat,
          start_lon: startLon,
          end_lat: endLat,
          end_lon: endLon
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setMapHtml(data.map_html);
        setPlotImage(`data:image/png;base64,${data.plot_image}`);
        setDistance(data.shortest_distance_km);
        setActiveTab('map');
      } else {
        setError(data.message || 'No path found');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="app-title">
              <span className="title-gradient">A* Pathfinder</span>
            </h1>
          </div>
          <p className="app-subtitle">Find optimal routes with AI pathfinding</p>
        </div>
      </header>

      <main className="app-main">
        <div className="control-panel">
          <div className="panel-header">
            <h3>Route Parameters</h3>
          </div>
          
          <div className="input-grid">
            <div className="input-group">
              <label className="input-label">
                Start Location
              </label>
              <div className="coord-inputs">
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    value={startLat}
                    onChange={(e) => setStartLat(e.target.value)}
                    className="modern-input"
                    placeholder="Latitude"
                  />
                </div>
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    value={startLon}
                    onChange={(e) => setStartLon(e.target.value)}
                    className="modern-input"
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                End Location
              </label>
              <div className="coord-inputs">
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    value={endLat}
                    onChange={(e) => setEndLat(e.target.value)}
                    className="modern-input"
                    placeholder="Latitude"
                  />
                </div>
                <div className="input-with-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    value={endLon}
                    onChange={(e) => setEndLon(e.target.value)}
                    className="modern-input"
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="action-button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Calculating Path...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Find Optimal Path</span>
              </>
            )}
          </button>

          {distance && (
            <div className="distance-display">
              <div className="distance-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 12H20M4 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="distance-info">
                <div className="distance-label">Shortest Distance</div>
                <div className="distance-value">{distance.toFixed(2)} <span>km</span></div>
              </div>
            </div>
          )}

          {error && <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>}
        </div>

        <div className="visualization-container">
          <div className="tab-nav">
            <button 
              className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19L3 21V5L9 3M9 19L15 21M9 19V3M15 21L21 19V3L15 5M15 21V5M15 5L9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Interactive Map
            </button>
            <button 
              className={`tab-button ${activeTab === 'plot' ? 'active' : ''}`}
              onClick={() => setActiveTab('plot')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21H6.2C5.07989 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4802 3 18.9201 3 17.8V3M21 7L15.5657 12.4343C15.3677 12.6323 15.2687 12.7313 15.1545 12.7684C15.0541 12.8011 14.9459 12.8011 14.8455 12.7684C14.7313 12.7313 14.6323 12.6323 14.4343 12.4343L12.5657 10.5657C12.3677 10.3677 12.2687 10.2687 12.1545 10.2316C12.0541 10.1989 11.9459 10.1989 11.8455 10.2316C11.7313 10.2687 11.6323 10.3677 11.4343 10.5657L7 15M21 7H17M21 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Route Visualization
            </button>
            <div className="tab-indicator" style={{ 
              width: '50%', 
              transform: activeTab === 'map' ? 'translateX(0)' : 'translateX(100%)' 
            }}></div>
          </div>

          <div className="tab-content">
            {isLoading ? (
              <div className="loading-overlay">
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-inner"></div>
                </div>
                <p className="loading-text">Generating path visualizations...</p>
                <div className="loading-progress">
                  <div className="progress-bar" style={{ width: '65%' }}></div>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'map' && mapHtml && (
                  <div>
                  <div className="map-wrapper" dangerouslySetInnerHTML={{ __html: mapHtml }} />
                  <div className="plot-legend" style={{position:"absolute",top:"10px",right:"60px",background:"var(--bg-light)",color:"white",padding:"20px",borderRadius:"5px",display:"flex",flexDirection:"column",gap:"12px"}}>
                      <div className="legend-item">
                        <div className="legend-color start-point"></div>
                        <span>Start Point</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color end-point"></div>
                        <span>End Point</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color optimal-path"></div>
                        <span>Optimal Path</span>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'plot' && plotImage && (
                  <div className="plot-wrapper">
                    <img src={plotImage} alt="Route plot" className="plot-image" />
                  </div>
                )}
                {!mapHtml && !plotImage && (
                  <div className="empty-state">
                    <div className="empty-illustration">
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 6V2M12 2L14 4M12 2L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 14H22M22 14L20 12M22 14L20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 14H2M2 14L4 12M2 14L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22V20M12 20C10 18 8 16 6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>No Path Generated</h3>
                    <p>Enter coordinates and click "Find Optimal Path" to visualize the route</p>
                    <button className="empty-state-button" onClick={handleSubmit}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Calculate Path
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              About
            </a>
            <a href="#">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Contact
            </a>
            <a href="#">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              GitHub
            </a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} A* Pathfinder Visualization
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;