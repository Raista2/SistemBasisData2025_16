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
    const [isVisible, setIsVisible] = useState({});

    // Refs for intersection observer
    const filtersRef = useRef(null);
    const roomsRef = useRef(null);

    // Scroll handler for parallax
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

    // Throttle function for performance
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

    // Intersection Observer for animations
    useEffect(() => {
        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsVisible(prev => ({
                        ...prev,
                        [entry.target.id]: true
                    }));
                }
            });
        };

        // Fallback: Set all to visible after 2 seconds if observer fails
        const fallbackTimer = setTimeout(() => {
            setIsVisible({
                filters: true,
                rooms: true
            });
        }, 2000);

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        const elements = [filtersRef.current, roomsRef.current];
        elements.forEach(el => {
            if (el) {
                observer.observe(el);
            }
        });

        return () => {
            observer.disconnect();
            clearTimeout(fallbackTimer);
        };
    }, []);

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

    // Animation classes
    const fadeInUp = `transform transition-all duration-700 ease-out ${
        isVisible.filters ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-90'
    }`;

    const fadeInLeft = `transform transition-all duration-700 ease-out ${
        isVisible.rooms ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-90'
    }`;

    const staggeredAnimation = (index, isVisible) => ({
        opacity: isVisible ? 1 : 0.9,
        transform: isVisible ? 'translateY(0px)' : 'translateY(20px)',
        transition: `all 0.6s ease-out ${index * 0.1}s`
    });

    if (loading && rooms.length === 0) {
        return (
            <div className="pt-16 min-h-screen font-qanelas overflow-x-hidden relative">
                {/* Fixed Background */}
                <div 
                    className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
                    style={{ 
                        backgroundImage: `url(${bgUI})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        height: '200vh',
                        transform: `translateY(${-scrollY * 0.15}px)`,
                        opacity: 1
                    }}
                ></div>
                
                {/* Blur overlay */}
                <div className="fixed inset-0 bg-white/5 backdrop-blur-sm backdrop-filter pointer-events-none z-0"></div>
                
                <div className="flex justify-center items-center h-screen relative z-10">
                    <div className="flex flex-col items-center bg-white rounded-lg p-8 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                        <p className="text-primary-blue font-medium animate-pulse">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen font-qanelas overflow-x-hidden relative">
            {/* Fixed Background */}
            <div 
                className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
                style={{ 
                    backgroundImage: `url(${bgUI})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    height: '200vh',
                    transform: `translateY(${-scrollY * 0.15}px)`,
                    opacity: 1
                }}
            ></div>
            
            {/* Blur overlay */}
            <div className="fixed inset-0 bg-white/5 backdrop-blur-sm backdrop-filter pointer-events-none z-0"></div>

            {/* Hero Section */}
            <div className="bg-primary-blue text-white py-12 relative overflow-hidden w-full">                
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-qanelas font-[950] mb-4 animate-fade-in-down">
                            Reservasi Ruangan
                        </h1>
                        <p className="text-xl font-medium animate-fade-in-up animation-delay-200">
                            Pilih gedung dan ruangan yang sesuai dengan kebutuhan Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="relative py-4 w-full">
                    <div className="w-full px-4 relative z-10">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg animate-fade-in-up">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div id="filters" ref={filtersRef} className="relative py-8 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className={`bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-all duration-500 ${fadeInUp}`}>
                            {/* Building Selection */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-qanelas font-[800] mb-6 text-gray-800 flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Pilih Gedung
                                </h2>
                                
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-64">
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
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
                                        className="flex items-center bg-primary-blue text-white py-3 px-6 rounded-lg hover:bg-bem-darkblue transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg"
                                    >
                                        <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12 1.586l-4 4-4-4-4 4v12.828l4-4 4 4 4-4 4 4V1.586l-4 4zM3.707 3.293L2 5v10.586l1.293-1.293a1 1 0 011.414 0L6 15.586l2.293-2.293a1 1 0 011.414 0L12 15.586l2.293-2.293a1 1 0 011.414 0L17 14.586V5l-1.707-1.707a1 1 0 00-1.414 0L12 5.172 10.121 3.293a1 1 0 00-1.414 0L6 5.172 4.121 3.293a1 1 0 00-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        🗺️ Lihat Peta
                                    </Link>
                                    
                                    <Link
                                        to="/my-reservations"
                                        className="flex items-center bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg"
                                    >
                                        <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        📋 Reservasiku
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Filters */}
                            <div className="border-t border-gray-200 pt-8">
                                <h2 className="text-2xl font-qanelas font-[800] mb-6 text-gray-800 flex items-center">
                                    <svg className="w-6 h-6 mr-3 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                    </svg>
                                    Filter Ruangan
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="group">
                                        <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Pencarian
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                            placeholder="Cari nama ruangan..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="group">
                                        <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Tipe Ruangan
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="">Semua Tipe</option>
                                            <option value="kelas">🏫 Kelas</option>
                                            <option value="laboratorium">🔬 Laboratorium</option>
                                            <option value="aula">🏛️ Aula</option>
                                            <option value="rapat">💼 Ruang Rapat</option>
                                            <option value="seminar">🎓 Ruang Seminar</option>
                                        </select>
                                    </div>
                                    
                                    <div className="group">
                                        <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Kapasitas
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                            value={filterCapacity}
                                            onChange={(e) => setFilterCapacity(e.target.value)}
                                        >
                                            <option value="">Semua Kapasitas</option>
                                            <option value="1-20">👥 1-20 orang</option>
                                            <option value="21-50">👫 21-50 orang</option>
                                            <option value="51-100">👪 51-100 orang</option>
                                            <option value="100+">👥👥 Lebih dari 100 orang</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button
                                        onClick={resetFilters}
                                        className="flex items-center text-primary-blue hover:text-white hover:bg-primary-blue px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms Section */}
            <div id="rooms" ref={roomsRef} className="relative py-8 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <h2 className={`text-3xl font-qanelas font-[950] mb-6 text-white text-center ${fadeInLeft}`}>
                            Daftar Ruangan
                        </h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="flex flex-col items-center bg-white rounded-lg p-8 shadow-xl">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                                    <p className="text-primary-blue font-medium">Loading...</p>
                                </div>
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className={`bg-white rounded-lg shadow-xl p-12 text-center ${fadeInLeft}`}>
                                <div className="flex flex-col items-center">
                                    <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="text-2xl font-qanelas font-[700] text-gray-600 mb-4">
                                        Tidak ada ruangan tersedia
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {rooms.length === 0
                                            ? 'Tidak ada ruangan tersedia untuk gedung ini.'
                                            : 'Tidak ada ruangan yang sesuai dengan filter yang dipilih.'}
                                    </p>
                                    {rooms.length > 0 && (
                                        <button
                                            onClick={resetFilters}
                                            className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-bem-darkblue transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Reset Filter
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${fadeInLeft}`}>
                                {filteredRooms.map((room, index) => (
                                    <div 
                                        key={room.id} 
                                        className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group"
                                        style={staggeredAnimation(index, isVisible.rooms)}
                                    >
                                        {/* Room Image */}
                                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                            {room.imageUrl ? (
                                                <img
                                                    src={room.imageUrl}
                                                    alt={`Ruangan ${room.name}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 font-normal">
                                                    <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    No Image Available
                                                </div>
                                            )}
                                        </div>

                                        {/* Room Info */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-qanelas font-[700] mb-4 text-gray-800 group-hover:text-primary-blue transition-colors duration-300">
                                                {room.name}
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                {[
                                                    { icon: "👥", label: "Kapasitas", value: `${room.capacity} orang` },
                                                    { icon: "🏢", label: "Lantai", value: room.floor },
                                                    { icon: "📐", label: "Luas", value: `${room.size} m²` },
                                                    { icon: "🏷️", label: "Tipe", value: room.type }
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                                        <div className="flex items-center">
                                                            <span className="text-xl mr-2">{item.icon}</span>
                                                            <div>
                                                                <p className="text-xs text-gray-500">{item.label}</p>
                                                                <p className="font-semibold text-gray-800">{item.value}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Link
                                                to={`/reservation/${room.id}`}
                                                className="block w-full bg-primary-blue text-white py-3 px-4 rounded-lg hover:bg-bem-darkblue transition-all duration-300 text-center font-medium transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Reservasi Ruangan
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
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

                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-fade-in-down {
                    animation: fadeInDown 0.8s ease-out;
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out;
                }

                .animate-fade-in-left {
                    animation: fadeInLeft 0.8s ease-out;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }

                /* Form focus animations */
                .group:focus-within {
                    transform: translateY(-1px);
                }

                /* Input hover and focus effects */
                input:focus, select:focus {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                /* Smooth transitions for all interactive elements */
                * {
                    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Reduced motion for accessibility */
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                /* Smooth scrolling */
                html {
                    scroll-behavior: smooth;
                }

                /* Enhanced button hover effects */
                button:hover:not(:disabled), a:hover {
                    transform: translateY(-1px);
                }

                /* Enhanced card hover effects */
                .group:hover .group-hover\\:text-primary-blue {
                    color: #1e40af;
                }

                .group:hover .group-hover\\:scale-105 {
                    transform: scale(1.05);
                }

                /* Loading spinner animation */
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                /* Enhanced shadow effects */
                .shadow-2xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                /* Card scaling animation */
                .hover\\:scale-\\[1\\.02\\]:hover {
                    transform: scale(1.02);
                }

                /* Enhanced form field styling */
                input:hover, select:hover {
                    border-color: #9CA3AF;
                }

                /* Button press effect */
                button:active, a:active {
                    transform: translateY(0px) scale(0.98);
                }

                /* Gradient text effect for headings */
                .text-gradient {
                    background: linear-gradient(45deg, #1e40af, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Enhanced focus states */
                button:focus, a:focus, input:focus, select:focus {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }

                /* Staggered animation timing */
                .animate-stagger-1 { animation-delay: 0.1s; }
                .animate-stagger-2 { animation-delay: 0.2s; }
                .animate-stagger-3 { animation-delay: 0.3s; }
                .animate-stagger-4 { animation-delay: 0.4s; }
                .animate-stagger-5 { animation-delay: 0.5s; }
                .animate-stagger-6 { animation-delay: 0.6s; }
            `}</style>
        </div>
    );
};

export default ReservationLanding;