import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Map = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Mock function to simulate API call
        const fetchBuildingsMock = () => {
            // Mock data
            const mockBuildings = [
                {
                    id: 1,
                    name: "Gedung S",
                    acronym: "S",
                    mapPositionX: 20,
                    mapPositionY: 30
                },
                {
                    id: 2,
                    name: "Gedung K",
                    acronym: "K",
                    mapPositionX: 50,
                    mapPositionY: 40
                },
                {
                    id: 3,
                    name: "Gedung GK",
                    acronym: "GK",
                    mapPositionX: 70,
                    mapPositionY: 60
                }
            ];

            // Simulate API delay
            setTimeout(() => {
                setBuildings(mockBuildings);
                setLoading(false);
            }, 700);
        };

        fetchBuildingsMock();
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

            <div className="relative w-full h-[600px] border-2 border-gray-300 rounded-lg overflow-hidden mb-8 bg-gray-100">
                {/* Placeholder for map image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <img
                        src="https://sm.ign.com/t/ign_nordic/review/z/zenless-zo/zenless-zone-zero-review_fes2.1200.jpg"
                        alt="Campus Map"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Building markers on the map */}
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
                        <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {building.acronym || building.name.charAt(0)}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-black px-2 py-1 rounded shadow text-sm whitespace-nowrap mt-1">
                            {building.name}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blacl p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-3">Legenda</h2>
                <div className="flex flex-wrap gap-4">
                    {buildings.map((building) => (
                        <div
                            key={building.id}
                            className="flex items-center cursor-pointer"
                            onClick={() => handleBuildingClick(building.id)}
                        >
                            <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                            <span>{building.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Map;