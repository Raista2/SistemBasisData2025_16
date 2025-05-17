import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const Ruangan = () => {
    const { buildingId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [building, setBuilding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Mock function to simulate API call
        const fetchBuildingAndRoomsMock = () => {
            // Mock building data
            const mockBuilding = {
                id: parseInt(buildingId),
                name: `Gedung ${String.fromCharCode(64 + parseInt(buildingId))}`,
                location: "Kampus Utama",
                operationHours: "08:00 - 17:00",
                manager: "John Doe"
            };

            // Mock rooms data
            const mockRooms = [
                {
                    id: 101,
                    buildingId: parseInt(buildingId),
                    name: `Ruangan ${buildingId}01`,
                    capacity: 30,
                    floor: 1,
                    size: 40,
                    type: "Kelas",
                    imageUrl: null
                },
                {
                    id: 102,
                    buildingId: parseInt(buildingId),
                    name: `Ruangan ${buildingId}02`,
                    capacity: 50,
                    floor: 1,
                    size: 65,
                    type: "Laboratorium",
                    imageUrl: null
                },
                {
                    id: 103,
                    buildingId: parseInt(buildingId),
                    name: `Ruangan ${buildingId}03`,
                    capacity: 20,
                    floor: 2,
                    size: 30,
                    type: "Seminar",
                    imageUrl: null
                }
            ];

            // Simulate API delay
            setTimeout(() => {
                setBuilding(mockBuilding);
                setRooms(mockRooms);
                setLoading(false);
            }, 700);
        };

        fetchBuildingAndRoomsMock();
    }, [buildingId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (error || !building) {
        return (
            <div className="pt-16 container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || "Building not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 md:p-10 lg:p-20">
            <div className="flex items-center mb-6">
                <Link to="/gedung" className="text-blue-600 hover:underline mr-2">
                    &larr; Kembali ke Daftar Gedung
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-black">
                <h1 className="text-3xl font-bold mb-2">{building?.name}</h1>
                <p className="text-gray-600 mb-4">{building?.location}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-gray-700 font-semibold">Jam Operasional:</span>
                        <span className="ml-2">{building?.operationHours}</span>
                    </div>
                    <div>
                        <span className="text-gray-700 font-semibold">Jumlah Ruangan:</span>
                        <span className="ml-2">{rooms.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-700 font-semibold">Pengelola:</span>
                        <span className="ml-2">{building?.manager || "N/A"}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-black">Daftar Ruangan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Link
                        to={`/reservation/${room.id}`}
                        key={room.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="h-40 bg-gray-200">
                            {room.imageUrl ? (
                                <img
                                    src={room.imageUrl}
                                    alt={`Ruangan ${room.name}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div>
                                    <span className="text-gray-700 font-semibold">Kapasitas:</span>
                                    <span className="ml-1">{room.capacity} orang</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Lantai:</span>
                                    <span className="ml-1">{room.floor}</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Luas:</span>
                                    <span className="ml-1">{room.size} m²</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Tipe:</span>
                                    <span className="ml-1">{room.type}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                    <p className="text-gray-600">Tidak ada ruangan yang tersedia di gedung ini.</p>
                </div>
            )}
        </div>
    );
};

export default Ruangan;