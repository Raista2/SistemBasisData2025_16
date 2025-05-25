import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GedungService from '../services/GedungService';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke, Text } from 'ol/style';

// Koordinat UI Depok (center)
const DEFAULT_CENTER = [106.82307, -6.36157]; 
const DEFAULT_ZOOM = 17;

// Koordinat gedung-gedung (hasil konversi dari Plus Code)
const BUILDING_COORDINATES = {
    "Gedung Dekanat": [106.82402136574673, -6.361659353302688],
    "Gedung K": [106.8240595657383, -6.3624280673482365],
    "Gedung S": [106.82468938927117, -6.361482386077552],
    "Gedung GK": [106.82459880268621, -6.3612377953670896],
    "Gedung A": [106.82347, -6.36132],
    "Gedung E.C": [106.82511271888151, -6.3622051691798],
    "Gedung ICell": [106.8229403292571, -6.362859290375997]
};

const MapComponent = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [mapStyle, setMapStyle] = useState('satellite');
    const mapRef = useRef(null);
    const olMapRef = useRef(null);
    const navigate = useNavigate();

    // Handler untuk mengukur dimensi container map saat di-render
    useEffect(() => {
        const updateDimensions = () => {
            if (mapContainerRef.current) {
                setMapDimensions({
                    width: mapContainerRef.current.offsetWidth,
                    height: mapContainerRef.current.offsetHeight
                });
            }
        };

        // Update dimensi saat komponen di-mount
        updateDimensions();

        // Tambahkan event listener untuk resize
        window.addEventListener('resize', updateDimensions);

        // Cleanup event listener
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                setLoading(true);
                const data = await GedungService.getAllGedung();
                
                const mappedBuildings = data.map(building => {
                    const coordinates = BUILDING_COORDINATES[building.name] || DEFAULT_CENTER;
                    
                    return {
                        id: building.id,
                        name: building.name,
                        acronym: building.singkatan || building.name.substring(building.name.lastIndexOf(' ') + 1),
                        coordinates: fromLonLat(coordinates),
                        description: `${building.name} - Fakultas Teknik UI`
                    };
                });
                
                setBuildings(mappedBuildings);
                setError(null);
            } catch (err) {
                console.error('Error fetching buildings for map:', err);
                setError('Gagal memuat data gedung. Silakan coba lagi nanti.');
                
                const fallbackBuildings = [
                    { id: 1, name: "Gedung Dekanat", acronym: "D" },
                    { id: 2, name: "Gedung K", acronym: "K" },
                    { id: 3, name: "Gedung S", acronym: "S" },
                    { id: 4, name: "Gedung GK", acronym: "GK" },
                    { id: 5, name: "Gedung A", acronym: "A" },
                    { id: 6, name: "Gedung E.C", acronym: "EC" },
                    { id: 7, name: "Gedung ICell", acronym: "IC" },
                    { id: 8, name: "Area Lain", acronym: "AL" }
                ].map(building => {
                    const coordinates = BUILDING_COORDINATES[building.name] || DEFAULT_CENTER;
                    return {
                        ...building,
                        coordinates: fromLonLat(coordinates),
                        description: `${building.name} - Fakultas Teknik UI`
                    };
                });
                
                setBuildings(fallbackBuildings);

            } finally {
                setLoading(false);
            }
        };

        fetchBuildings();
    }, []);

    // Map style configurations
    const mapStyles = {
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            name: 'Satelit'
        },
        street: {
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            name: 'Peta Jalan'
        },
        terrain: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            name: 'Terrain'
        }
    };

    // Initialize the map
    useEffect(() => {
        if (loading || buildings.length === 0 || !mapRef.current) return;

        // Always recreate the map to reflect coordinate changes
        if (olMapRef.current) {
            olMapRef.current.setTarget(null);
            olMapRef.current = null;
        }

        const features = buildings.map((building, index) => {
            const feature = new Feature({
                geometry: new Point(building.coordinates),
                name: building.name,
                id: building.id,
                acronym: building.acronym,
                description: building.description
            });
            
            // Animated marker styles
            feature.setStyle(new Style({
                image: new Circle({
                    radius: 16,
                    fill: new Fill({ color: '#3b82f6' }),
                    stroke: new Stroke({ 
                        color: '#ffffff', 
                        width: 3 
                    })
                }),
                text: new Text({
                    text: building.acronym,
                    fill: new Fill({ color: '#ffffff' }),
                    font: 'bold 11px Inter, sans-serif',
                    offsetY: 1
                })
            }));
            
            return feature;
        });

        const vectorSource = new VectorSource({ features });
        const vectorLayer = new VectorLayer({ source: vectorSource });

        const rasterLayer = new TileLayer({
            source: new XYZ({
                url: mapStyles[mapStyle].url,
                maxZoom: 20,
                attributions: mapStyle === 'satellite' 
                    ? 'Tiles &copy; Esri' 
                    : '&copy; OpenStreetMap contributors'
            })
        });

        olMapRef.current = new Map({
            target: mapRef.current,
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: fromLonLat(DEFAULT_CENTER),
                zoom: DEFAULT_ZOOM,
                maxZoom: 20,
                minZoom: 10
            }),
            controls: []
        });

        // Enhanced click interaction
        olMapRef.current.on('click', function(evt) {
            const feature = olMapRef.current.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });
            
            if (feature) {
                const buildingData = {
                    id: feature.get('id'),
                    name: feature.get('name'),
                    description: feature.get('description')
                };
                setSelectedBuilding(buildingData);
                
                // Animate to clicked building
                const view = olMapRef.current.getView();
                view.animate({
                    center: feature.getGeometry().getCoordinates(),
                    zoom: 19,
                    duration: 1000
                });
            }
        });

        // Enhanced hover effects
        olMapRef.current.on('pointermove', function(evt) {
            const pixel = olMapRef.current.getEventPixel(evt.originalEvent);
            const feature = olMapRef.current.forEachFeatureAtPixel(pixel, function(feature) {
                return feature;
            });
            
            if (feature) {
                olMapRef.current.getViewport().style.cursor = 'pointer';
                
                // Highlight effect
                feature.setStyle(new Style({
                    image: new Circle({
                        radius: 20,
                        fill: new Fill({ color: '#ef4444' }),
                        stroke: new Stroke({ 
                            color: '#ffffff', 
                            width: 4 
                        })
                    }),
                    text: new Text({
                        text: feature.get('acronym'),
                        fill: new Fill({ color: '#ffffff' }),
                        font: 'bold 12px Inter, sans-serif',
                        offsetY: 1
                    })
                }));
            } else {
                olMapRef.current.getViewport().style.cursor = '';
                
                // Reset all features to default style
                vectorSource.getFeatures().forEach(f => {
                    f.setStyle(new Style({
                        image: new Circle({
                            radius: 16,
                            fill: new Fill({ color: '#3b82f6' }),
                            stroke: new Stroke({ 
                                color: '#ffffff', 
                                width: 3 
                            })
                        }),
                        text: new Text({
                            text: f.get('acronym'),
                            fill: new Fill({ color: '#ffffff' }),
                            font: 'bold 11px Inter, sans-serif',
                            offsetY: 1
                        })
                    }));
                });
            }
        });

        return () => {
            if (olMapRef.current) {
                olMapRef.current.setTarget(null);
                olMapRef.current = null;
            }
        };
    }, [buildings, loading, navigate, mapStyle]); // Added mapStyle to dependencies

    // Change map style
    const changeMapStyle = (newStyle) => {
        setMapStyle(newStyle);
        if (olMapRef.current) {
            const layers = olMapRef.current.getLayers();
            const rasterLayer = layers.item(0);
            rasterLayer.setSource(new XYZ({
                url: mapStyles[newStyle].url,
                maxZoom: 20,
                attributions: newStyle === 'satellite' 
                    ? 'Tiles &copy; Esri' 
                    : '&copy; OpenStreetMap contributors'
            }));
        }
    };

    // Reset map view
    const resetView = () => {
        if (olMapRef.current) {
            const view = olMapRef.current.getView();
            view.animate({
                center: fromLonLat(DEFAULT_CENTER),
                zoom: DEFAULT_ZOOM,
                duration: 1000
            });
        }
        setSelectedBuilding(null);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
                    <p className="text-white font-medium">Memuat peta gedung...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-red-900 via-pink-900 to-rose-900">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md mx-4">
                    <div className="text-center">
                        <div className="text-red-300 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Error</h3>
                        <p className="text-white/80">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-300"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Custom CSS for animations */}
            <style jsx>{`
                .map-container {
                    position: relative;
                    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .glass-panel {
                    backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                
                .glass-button {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .glass-button:hover {
                    background: rgba(255, 255, 255, 0.25);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }
                
                .pulse-animation {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: .5;
                    }
                }
                
                .slide-in {
                    animation: slideIn 0.5s ease-out;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .bounce-in {
                    animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes bounceIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            {/* Always Fullscreen Container */}
            <div className="fixed inset-0 pt-16">
                {/* Map Container - Always fullscreen */}
                <div className="map-container h-full w-full relative">
                    <div 
                        ref={mapRef}
                        className="w-full h-full"
                    ></div>

                    {/* Floating Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3">
                        <button
                            onClick={resetView}
                            className="glass-button text-white p-3 rounded-lg shadow-lg"
                            title="Reset View"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        <button
                            onClick={() => setIsLegendOpen(!isLegendOpen)}
                            className="glass-button text-white p-3 rounded-lg shadow-lg"
                            title="Toggle Legend"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Map Style Selector */}
                    <div className="absolute top-4 left-4">
                        <div className="glass-panel rounded-lg p-2">
                            <div className="flex gap-2">
                                {Object.entries(mapStyles).map(([key, style]) => (
                                    <button
                                        key={key}
                                        onClick={() => changeMapStyle(key)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                                            mapStyle === key
                                                ? 'bg-white/30 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Building Info Panel */}
                    {selectedBuilding && (
                        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80">
                            <div className="glass-panel rounded-xl p-6 bounce-in">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{selectedBuilding.name}</h3>
                                        <p className="text-white/70 text-sm">{selectedBuilding.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedBuilding(null)}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate(`/ruangan/${selectedBuilding.id}`)}
                                        className="flex-1 bg-blue-500/80 hover:bg-blue-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                    >
                                        Lihat Ruangan
                                    </button>
                                    <button
                                        onClick={() => navigate(`/reservation?building=${selectedBuilding.id}`)}
                                        className="flex-1 bg-green-500/80 hover:bg-green-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                    >
                                        Reservasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend Panel */}
                    {isLegendOpen && (
                        <div className="absolute top-20 right-4 w-80 max-h-96 overflow-y-auto">
                            <div className="glass-panel rounded-xl p-6 slide-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold text-lg">📍 Daftar Gedung</h3>
                                    <button
                                        onClick={() => setIsLegendOpen(false)}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {buildings.map((building, index) => (
                                        <div
                                            key={building.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-105"
                                            onClick={() => {
                                                const buildingData = {
                                                    id: building.id,
                                                    name: building.name,
                                                    description: building.description
                                                };
                                                setSelectedBuilding(buildingData);
                                                
                                                if (olMapRef.current) {
                                                    const view = olMapRef.current.getView();
                                                    view.animate({
                                                        center: building.coordinates,
                                                        zoom: 19,
                                                        duration: 1000
                                                    });
                                                }
                                            }}
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 rounded-full bg-blue-500 mr-3 pulse-animation"></div>
                                                <div>
                                                    <div className="text-white font-medium">{building.name}</div>
                                                    <div className="text-white/60 text-sm">{building.acronym}</div>
                                                </div>
                                            </div>
                                            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MapComponent;