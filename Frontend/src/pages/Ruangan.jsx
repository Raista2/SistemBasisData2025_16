import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import GedungService from '../services/GedungService';
import RuanganService from '../services/RuanganService';

const Ruangan = () => {
    const { buildingId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [building, setBuilding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBuildingAndRooms = async () => {
            try {
                setLoading(true);
                // Fetch building and rooms data in parallel
                const [buildingData, roomsData] = await Promise.all([
                    GedungService.getGedungById(buildingId),
                    RuanganService.getRuanganByGedung(buildingId)
                ]);
                
                setBuilding(buildingData);
                setRooms(roomsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching building and rooms:', err);
                setError('Gagal memuat data gedung dan ruangan. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };

        fetchBuildingAndRooms();
    }, [buildingId]);

    if (loading) {
        return (
            <div className="pt-16 flex justify-center items-center h-screen font-qanelas bg-white">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                    <p className="text-primary-blue font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !building) {
        return (
            <div className="pt-16 container mx-auto px-4 py-8 bg-white">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || "Building not found"}
                </div>
                <div className="mt-4">
                    <Link 
                        to="/gedung"
                        className="text-primary-blue hover:text-bem-darkblue font-medium transition-colors"
                    >
                        &larr; Kembali ke Daftar Gedung
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 bg-white">
            <div className="flex items-center mb-6">
                <Link 
                    to="/gedung" 
                    className="text-primary-blue hover:text-bem-darkblue font-medium transition-colors"
                >
                    &larr; Kembali ke Daftar Gedung
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-3xl font-qanelas font-[950] mb-2 text-primary-blue">{building?.name}</h1>
                <p className="text-gray-600 mb-4 font-normal">{building?.location}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800">
                    <div>
                        <span className="text-gray-700 font-medium">Jam Operasional:</span>
                        <span className="ml-2 font-normal">{building?.jam_operasional || building?.operationHours || "N/A"}</span>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Jumlah Ruangan:</span>
                        <span className="ml-2 font-normal">{building?.jumlah_ruangan || rooms.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Pengelola:</span>
                        <span className="ml-2 font-normal">{building?.pengelola || building?.manager || "N/A"}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-qanelas font-[800] mb-4 text-gray-800">Daftar Ruangan</h2>

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
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-normal">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-qanelas font-[700] mb-2 text-gray-800">{room.name}</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm font-normal text-gray-800">
                                <div>
                                    <span className="text-gray-700 font-medium">Kapasitas:</span>
                                    <span className="ml-1">{room.capacity} orang</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-medium">Lantai:</span>
                                    <span className="ml-1">{room.floor}</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-medium">Luas:</span>
                                    <span className="ml-1">{room.size} m²</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-medium">Tipe:</span>
                                    <span className="ml-1">{room.type}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                    <p className="text-gray-600 font-normal">Tidak ada ruangan yang tersedia di gedung ini.</p>
                    <Link 
                        to="/gedung"
                        className="mt-4 inline-block text-primary-blue hover:text-bem-darkblue font-medium transition-colors"
                    >
                        Kembali ke Daftar Gedung
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Ruangan;