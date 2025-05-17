import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GedungService from '../services/GedungService';

// Posisi default untuk gedung jika tidak ada di database
const DEFAULT_POSITIONS = {
    1: { x: 20, y: 30 },
    2: { x: 50, y: 20 },
    3: { x: 70, y: 40 },
    4: { x: 30, y: 60 },
    5: { x: 80, y: 70 },
};

const Map = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
    const mapContainerRef = useRef(null);
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
                
                // Transform data untuk kebutuhan peta
                const mappedBuildings = data.map(building => {
                    // Dapatkan posisi default berdasarkan ID
                    const defaultPosition = DEFAULT_POSITIONS[building.id] || { x: 50, y: 50 };
                    
                    return {
                        id: building.id,
                        name: building.name,
                        acronym: building.singkatan || building.name.charAt(0),
                        // Gunakan data posisi dari backend
                        mapPositionX: building.posisi_peta_x || defaultPosition.x,
                        mapPositionY: building.posisi_peta_y || defaultPosition.y
                    };
                });
                
                setBuildings(mappedBuildings);
                setError(null);
            } catch (err) {
                console.error('Error fetching buildings for map:', err);
                setError('Gagal memuat data gedung. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };

        fetchBuildings();
    }, []);

    const handleBuildingClick = (buildingId) => {
        navigate(`/ruangan/${buildingId}`);
    };

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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Peta Gedung</h1>

            {/* Map container dengan aspect ratio yang responsif */}
            <div className="relative w-full pb-[56.25%] md:pb-[75%] border-2 border-gray-300 rounded-lg overflow-hidden mb-8 bg-gray-100" ref={mapContainerRef}>
                {/* Map image container yang mengisi seluruh area parent */}
                <div className="absolute inset-0">
                    <img
                        src="https://hackmd.io/_uploads/rkeeYFH-gx.png"
                        alt="Campus Map"
                        className="w-full h-full object-cover"
                    />

                    {/* Building markers */}
                    {buildings.map((building) => (
                        <div
                            key={building.id}
                            className="absolute cursor-pointer transform hover:scale-110 transition-transform"
                            style={{
                                top: `${building.mapPositionY}%`,
                                left: `${building.mapPositionX}%`,
                            }}
                            onClick={() => handleBuildingClick(building.id)}
                        >
                            {/* Marker size responsive */}
                            <div className="bg-blue-600 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs sm:text-sm">
                                {building.acronym || building.name.charAt(0)}
                            </div>
                            {/* Tooltip yang responsif */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-2 py-1 rounded shadow text-xs sm:text-sm whitespace-nowrap mt-1 text-white hidden group-hover:block md:block">
                                {building.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legenda dalam bentuk grid yang responsif */}
            <div className="bg-white p-4 rounded-lg shadow-md text-black">
                <h2 className="text-xl font-bold mb-3">Legenda</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {buildings.map((building) => (
                        <div
                            key={building.id}
                            className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleBuildingClick(building.id)}
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

export default Map;