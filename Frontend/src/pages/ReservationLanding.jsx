import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GedungService from '../services/GedungService';
import RuanganService from '../services/RuanganService';
import bgUI from '../assets/images/bg-ui.png';

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
    const [scrollY, setScrollY] = useState(0);
    const backgroundRef = useRef(null);

    // Parallax scroll handler
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
        };
        
        const throttledScroll = throttle(handleScroll, 16);
        window.addEventListener('scroll', throttledScroll);
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', throttledScroll);
        };
    }, []);

    // Throttle function untuk performance
    const throttle = (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    };

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
            <div className="fixed inset-0 pt-16 flex justify-center items-center">
                {/* Background with bgUI */}
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: `url(${bgUI})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        filter: 'blur(2px) brightness(0.4)'
                    }}
                />
                
                {/* Glass morphism card */}
                <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12 shadow-2xl max-w-md mx-4">
                    <div className="text-center">
                        {/* Subtle loading animation - bars */}
                        <div className="flex justify-center items-end space-x-2 mb-8">
                            <div className="w-2 h-8 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '1.2s'}}></div>
                            <div className="w-2 h-12 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0.2s', animationDuration: '1.2s'}}></div>
                            <div className="w-2 h-6 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s', animationDuration: '1.2s'}}></div>
                            <div className="w-2 h-10 bg-white/80 rounded-full animate-pulse" style={{animationDelay: '0.6s', animationDuration: '1.2s'}}></div>
                            <div className="w-2 h-4 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.8s', animationDuration: '1.2s'}}></div>
                        </div>
                        
                        <h3 className="text-white font-bold text-xl mb-3">Memuat Data</h3>
                        <p className="text-white/80 text-sm">Mohon tunggu sebentar...</p>
                        
                        {/* Subtle progress bar */}
                        <div className="mt-6 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-blue to-primary-yellow rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Custom CSS */}
            <style jsx>{`
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
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }

                .glass-input {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                }

                .glass-input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }

                .glass-input:focus {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.5);
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
                }

                .glass-select {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
                    appearance: none;
                }

                .glass-select:focus {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.5);
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
                }

                .glass-select option {
                    background: rgba(31, 41, 55, 0.95);
                    color: white;
                }

                .room-card {
                    backdrop-filter: blur(15px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .room-card:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                }

                .fade-in-up {
                    animation: fadeInUp 0.6s ease-out;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .stagger-animation {
                    opacity: 0;
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .image-placeholder {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
                    backdrop-filter: blur(10px);
                }

                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: rgb(239, 68, 68);
                }
            `}</style>

            {/* Background dengan parallax */}
            <div 
                ref={backgroundRef}
                className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
                style={{ 
                    backgroundImage: `url(${bgUI})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    height: '200vh',
                    transform: `translateY(${-scrollY * 0.15}px)`,
                    opacity: 1,
                    filter: 'blur(1px) brightness(0.7)'
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 pt-20 pb-8 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Page Header */}
                        <div className="py-12 w-full mb-8">
                            <div className="text-center">
                                <h1 className="text-4xl md:text-5xl font-[950] text-white mb-4 drop-shadow-lg">
                                    Reservasi Ruangan
                                </h1>
                                <p className="text-white/80 text-lg max-w-2xl mx-auto">
                                    Pilih gedung dan temukan ruangan yang sesuai dengan kebutuhan Anda
                                </p>
                            </div>
                        </div>
                        
                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6">
                                <div className="glass-panel rounded-xl p-4 error-alert fade-in-up">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Building Selection & Quick Actions */}
                        <div className="py-8 w-full mb-8">
                            <div className="glass-panel rounded-2xl p-8 fade-in-up">
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-primary-blue/30 rounded-xl mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-[800] text-white">Pilih Gedung</h2>
                                </div>
                                
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1">
                                        <select
                                            className="w-full px-4 py-3 glass-select rounded-lg focus:outline-none transition-all duration-300"
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
                                    
                                    <div className="flex gap-3">
                                        <Link
                                            to="/map"
                                            className="glass-button text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300 flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            Lihat Peta
                                        </Link>
                                        
                                        <Link
                                            to="/my-reservations"
                                            className="glass-button text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300 flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-6 0V7" />
                                            </svg>
                                            Reservasiku
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Filter Section */}
                        <div className="py-8 w-full mb-8">
                            <div className="glass-panel rounded-2xl p-8 fade-in-up">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-primary-yellow/30 rounded-xl mr-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-[800] text-white">Filter Ruangan</h2>
                                    </div>
                                    
                                    <button
                                        onClick={resetFilters}
                                        className="glass-button text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="stagger-animation" style={{ animationDelay: '0.1s' }}>
                                        <label className="block text-white font-medium mb-3">Pencarian</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300"
                                            placeholder="Cari nama ruangan..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="stagger-animation" style={{ animationDelay: '0.2s' }}>
                                        <label className="block text-white font-medium mb-3">Tipe Ruangan</label>
                                        <select
                                            className="w-full px-4 py-3 glass-select rounded-lg focus:outline-none transition-all duration-300"
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
                                    
                                    <div className="stagger-animation" style={{ animationDelay: '0.3s' }}>
                                        <label className="block text-white font-medium mb-3">Kapasitas</label>
                                        <select
                                            className="w-full px-4 py-3 glass-select rounded-lg focus:outline-none transition-all duration-300"
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
                            </div>
                        </div>
                        
                        {/* Results Section Title */}
                        <div className="py-6 w-full mb-6">
                            <div className="flex items-center justify-center">
                                <h2 className="text-3xl font-[800] text-white text-center">
                                    🚪 Daftar Ruangan
                                </h2>
                            </div>
                            <p className="text-white/70 text-center mt-2">
                                {selectedBuilding ? 
                                    `Menampilkan ${filteredRooms.length} dari ${rooms.length} ruangan` :
                                    'Pilih gedung untuk melihat daftar ruangan'
                                }
                            </p>
                        </div>
                        
                        {/* Loading State */}
                        {loading ? (
                            <div className="py-12 w-full">
                                <div className="glass-panel rounded-xl p-12 text-center fade-in-up">
                                    <div className="relative mb-6">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
                                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-primary-yellow animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                                    </div>
                                    <p className="text-white font-medium text-lg">Memuat ruangan...</p>
                                </div>
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            /* Empty State */
                            <div className="py-12 w-full">
                                <div className="glass-panel rounded-xl p-12 text-center fade-in-up">
                                    <div className="text-white/60 mb-6">
                                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {rooms.length === 0 ? 'Tidak ada ruangan tersedia' : 'Tidak ada ruangan yang sesuai'}
                                    </h3>
                                    <p className="text-white/70">
                                        {rooms.length === 0
                                            ? 'Tidak ada ruangan tersedia untuk gedung ini.'
                                            : 'Tidak ada ruangan yang sesuai dengan filter yang dipilih. Coba ubah kriteria pencarian Anda.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Room Grid */
                            <div className="py-12 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredRooms.map((room, index) => (
                                        <div
                                            key={room.id}
                                            className="room-card rounded-xl overflow-hidden group stagger-animation"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {/* Room Image */}
                                            <div className="h-48 relative overflow-hidden">
                                                {room.imageUrl ? (
                                                    <img
                                                        src={room.imageUrl}
                                                        alt={`Ruangan ${room.name}`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full image-placeholder flex items-center justify-center">
                                                        <div className="text-center text-white/70">
                                                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <p className="text-sm font-medium">No Image Available</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            
                                            {/* Room Info */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-yellow transition-colors duration-300">
                                                    🏠 {room.name}
                                                </h3>
                                                
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center text-white/80">
                                                            <svg className="w-4 h-4 mr-2 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-white/60">Kapasitas</p>
                                                                <p className="text-sm font-semibold">{room.capacity} orang</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center text-white/80">
                                                            <svg className="w-4 h-4 mr-2 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4a1 1 0 011-1h4m12 0h4a1 1 0 011 1v4m0 12v4a1 1 0 01-1 1h-4M4 16v4a1 1 0 001 1h4" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-white/60">Luas</p>
                                                                <p className="text-sm font-semibold">{room.size} m²</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="flex items-center text-white/80">
                                                            <svg className="w-4 h-4 mr-2 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-white/60">Lantai</p>
                                                                <p className="text-sm font-semibold">{room.floor}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center text-white/80">
                                                            <svg className="w-4 h-4 mr-2 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-white/60">Tipe</p>
                                                                <p className="text-sm font-semibold">{room.type}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Link
                                                    to={`/reservation/${room.id}`}
                                                    className="block w-full text-center py-3 bg-primary-blue/60 hover:bg-primary-blue text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 group-hover:shadow-lg"
                                                >
                                                    Reservasi Ruangan
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReservationLanding;