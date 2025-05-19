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
    // ID Gedung: [longitude, latitude]
    "Gedung Dekanat": [106.82347, -6.36132], // JRQF+8J7
    "Gedung K": [106.82283, -6.36193],       // JRQF+2JF
    "Gedung S": [106.82407, -6.36124],       // JRQF+9VV
    "Gedung GK": [106.82470, -6.36107],      // JRQF+GR5
    "Gedung A": [106.82347, -6.36132],       // Asumsi lokasi (tidak ada di list)
    "Gedung E.C": [106.82347, -6.36132],     // Asumsi lokasi (tidak ada di list)
    "Gedung ICell": [106.82204, -6.36240]    // JRPF+X7C
};

const MapComponent = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const olMapRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                setLoading(true);
                const data = await GedungService.getAllGedung();
                
                // Transform data for the map
                const mappedBuildings = data.map(building => {
                    // Mendapatkan koordinat gedung dari BUILDING_COORDINATES
                    const coordinates = BUILDING_COORDINATES[building.name] || DEFAULT_CENTER;
                    
                    return {
                        id: building.id,
                        name: building.name,
                        acronym: building.singkatan || building.name.substring(building.name.lastIndexOf(' ') + 1),
                        coordinates: fromLonLat(coordinates)
                    };
                });
                
                setBuildings(mappedBuildings);
                setError(null);
            } catch (err) {
                console.error('Error fetching buildings for map:', err);
                setError('Gagal memuat data gedung. Silakan coba lagi nanti.');
                
                // Fallback data jika API gagal
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
                        coordinates: fromLonLat(coordinates)
                    };
                });
                
                setBuildings(fallbackBuildings);
            } finally {
                setLoading(false);
            }
        };

        fetchBuildings();
    }, []);

    // Initialize the map once buildings are loaded
    useEffect(() => {
        if (loading || buildings.length === 0 || !mapRef.current) return;

        // Only create the map if it doesn't exist yet
        if (!olMapRef.current) {
            // Create features for buildings
            const features = buildings.map(building => {
                const feature = new Feature({
                    geometry: new Point(building.coordinates),
                    name: building.name,
                    id: building.id,
                    acronym: building.acronym
                });
                
                // Set style for the feature
                feature.setStyle(new Style({
                    image: new Circle({
                        radius: 14,
                        fill: new Fill({ color: '#2563eb' }),
                        stroke: new Stroke({ color: '#ffffff', width: 2 })
                    }),
                    text: new Text({
                        text: building.acronym,
                        fill: new Fill({ color: '#ffffff' }),
                        font: 'bold 12px sans-serif'
                    })
                }));
                
                return feature;
            });

            // Create vector source and layer for buildings
            const vectorSource = new VectorSource({ features });
            const vectorLayer = new VectorLayer({ source: vectorSource });

            // Create satellite tile layer
            const rasterLayer = new TileLayer({
                source: new XYZ({
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    maxZoom: 19,
                    attributions: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                })
            });

            // Create the map
            olMapRef.current = new Map({
                target: mapRef.current,
                layers: [rasterLayer, vectorLayer],
                view: new View({
                    center: fromLonLat(DEFAULT_CENTER),
                    zoom: DEFAULT_ZOOM
                })
            });

            // Add click interaction
            olMapRef.current.on('click', function(evt) {
                const feature = olMapRef.current.forEachFeatureAtPixel(evt.pixel, function(feature) {
                    return feature;
                });
                
                if (feature) {
                    navigate(`/ruangan/${feature.get('id')}`);
                }
            });

            // Change cursor style on hover
            olMapRef.current.on('pointermove', function(evt) {
                const pixel = olMapRef.current.getEventPixel(evt.originalEvent);
                const hit = olMapRef.current.hasFeatureAtPixel(pixel);
                olMapRef.current.getViewport().style.cursor = hit ? 'pointer' : '';
            });
            
            // Popup untuk nama gedung saat hover
            const container = document.createElement('div');
            container.className = 'ol-popup';
            container.style.position = 'absolute';
            container.style.backgroundColor = 'white';
            container.style.padding = '5px';
            container.style.borderRadius = '4px';
            container.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
            container.style.display = 'none';
            container.style.zIndex = '1000';
            
            mapRef.current.appendChild(container);
            
            olMapRef.current.on('pointermove', function(evt) {
                const feature = olMapRef.current.forEachFeatureAtPixel(evt.pixel, function(feature) {
                    return feature;
                });
                
                if (feature) {
                    container.style.display = 'block';
                    container.style.left = (evt.pixel[0] + 10) + 'px';
                    container.style.top = (evt.pixel[1] + 10) + 'px';
                    container.innerHTML = feature.get('name');
                } else {
                    container.style.display = 'none';
                }
            });
        }

        // Cleanup function
        return () => {
            if (olMapRef.current) {
                olMapRef.current.setTarget(null);
                olMapRef.current = null;
            }
        };
    }, [buildings, loading, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-16 container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Peta Gedung</h1>

            {/* Map container */}
            <div 
                ref={mapRef}
                className="w-full h-[500px] border-2 border-gray-300 rounded-lg overflow-hidden mb-8"
            ></div>

            {/* Building legend */}
            <div className="bg-white p-4 rounded-lg shadow-md text-black">
                <h2 className="text-xl font-bold mb-3">Legenda</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {buildings.map((building) => (
                        <div
                            key={building.id}
                            className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/ruangan/${building.id}`)}
                        >
                            <div className="w-4 h-4 rounded-full bg-blue-600 mr-2 flex-shrink-0"></div>
                            <span className="truncate">{building.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapComponent;