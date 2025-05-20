import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GedungService from '../services/GedungService';
import RuanganService from '../services/RuanganService';

const ReservationLanding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCapacity, setFilterCapacity] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/reservation' } });
            return;
        }
        
        const fetchBuildings = async () => {
            try {
                const data = await GedungService.getAllGedung();
                setBuildings(data);
                // Select first building by default if available
                if (data.length > 0 && !selectedBuilding) {
                    setSelectedBuilding(data[0].id.toString());
                }
            } catch (err) {
                console.error('Error fetching buildings:', err);
                setError('Gagal memuat data gedung');
            }
        };
        
        fetchBuildings();
    }, [user, navigate]);

    useEffect(() => {
        if (selectedBuilding) {
            fetchRooms(selectedBuilding);
        }
    }, [selectedBuilding]);

    const fetchRooms = async (buildingId) => {
        try {
            setLoading(true);
            const data = await RuanganService.getRuanganByGedung(buildingId);
            setRooms(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('Gagal memuat data ruangan');
        } finally {
            setLoading(false);
        }
    };

    const handleBuildingChange = (e) => {
        setSelectedBuilding(e.target.value);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilterType('');
        setFilterCapacity('');
    };

    // Filter rooms based on search and filters
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = searchTerm === '' || 
            room.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === '' || 
            room.type.toLowerCase() === filterType.toLowerCase();
        
        const matchesCapacity = filterCapacity === '' ||
            (filterCapacity === '1-20' && room.capacity <= 20) ||
            (filterCapacity === '21-50' && room.capacity > 20 && room.capacity <= 50) ||
            (filterCapacity === '51-100' && room.capacity > 50 && room.capacity <= 100) ||
            (filterCapacity === '100+' && room.capacity > 100);
        
        return matchesSearch && matchesType && matchesCapacity;
    });

    if (loading && rooms.length === 0) {
        return (
            <div className="pt-16 flex justify-center items-center h-screen font-qanelas bg-white">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                    <p className="text-primary-blue font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 bg-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-qanelas font-[950] mb-6 text-primary-blue">Reservasi Ruangan</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-qanelas font-[800] mb-4 text-gray-800">Pilih Gedung</h2>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="w-full sm:w-auto sm:flex-1">
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800 font-normal"
                                value={selectedBuilding}
                                onChange={handleBuildingChange}
                            >
                                <option value="">Pilih Gedung</option>
                                {buildings.map(building => (
                                    <option key={building.id} value={building.id}>
                                        {building.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <Link
                            to="/map"
                            className="bg-primary-blue text-white py-2 px-4 rounded-md hover:bg-bem-darkblue transition-colors flex items-center font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 1.586l-4 4-4-4-4 4v12.828l4-4 4 4 4-4 4 4V1.586l-4 4zM3.707 3.293L2 5v10.586l1.293-1.293a1 1 0 011.414 0L6 15.586l2.293-2.293a1 1 0 011.414 0L12 15.586l2.293-2.293a1 1 0 011.414 0L17 14.586V5l-1.707-1.707a1 1 0 00-1.414 0L12 5.172 10.121 3.293a1 1 0 00-1.414 0L6 5.172 4.121 3.293a1 1 0 00-1.414 0z" clipRule="evenodd" />
                            </svg>
                            Lihat Peta
                        </Link>
                        
                        <Link
                            to="/my-reservations"
                            className="bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Reservasiku
                        </Link>
                    </div>
                    
                    <h2 className="text-xl font-qanelas font-[800] mb-4 text-gray-800">Filter Ruangan</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Pencarian</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800 font-normal"
                                placeholder="Cari nama ruangan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tipe Ruangan</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800 font-normal"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">Semua Tipe</option>
                                <option value="kelas">Kelas</option>
                                <option value="laboratorium">Laboratorium</option>
                                <option value="aula">Aula</option>
                                <option value="rapat">Ruang Rapat</option>
                                <option value="seminar">Ruang Seminar</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Kapasitas</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800 font-normal"
                                value={filterCapacity}
                                onChange={(e) => setFilterCapacity(e.target.value)}
                            >
                                <option value="">Semua Kapasitas</option>
                                <option value="1-20">1-20 orang</option>
                                <option value="21-50">21-50 orang</option>
                                <option value="51-100">51-100 orang</option>
                                <option value="100+">Lebih dari 100 orang</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            onClick={resetFilters}
                            className="text-primary-blue hover:text-bem-darkblue font-medium transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>
                
                <h2 className="text-2xl font-qanelas font-[800] mb-4 text-gray-800">Daftar Ruangan</h2>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                            <p className="text-primary-blue font-medium">Loading...</p>
                        </div>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="bg-gray-100 p-8 rounded-lg text-center">
                        <p className="text-gray-600 font-normal">
                            {rooms.length === 0
                                ? 'Tidak ada ruangan tersedia untuk gedung ini.'
                                : 'Tidak ada ruangan yang sesuai dengan filter yang dipilih.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-4 font-normal text-gray-800">
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
                                    <Link
                                        to={`/reservation/${room.id}`}
                                        className="block w-full bg-primary-blue text-white py-2 px-4 rounded-md hover:bg-bem-darkblue transition-colors text-center font-medium"
                                    >
                                        Reservasi Ruangan
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationLanding;