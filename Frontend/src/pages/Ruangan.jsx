import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import GedungService from '../services/GedungService';
import RuanganService from '../services/RuanganService';
import bgUI from '../assets/images/bg-ui.png';

const Ruangan = () => {
    const { buildingId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [building, setBuilding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const backgroundRef = useRef(null);

    // Parallax scroll handler seperti homepage
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

    if (error || !building) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-red-900 via-pink-900 to-rose-900">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md mx-4">
                    <div className="text-center">
                        <div className="text-red-300 mb-6">
                            <svg className="w-20 h-20 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-3">Oops!</h3>
                        <p className="text-white/80 mb-6">{error || "Gedung tidak ditemukan"}</p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="block w-full px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            >
                                Coba Lagi
                            </button>
                            <Link 
                                to="/gedung"
                                className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                            >
                                ← Kembali ke Daftar Gedung
                            </Link>
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
            `}</style>

            {/* Background dengan parallax seperti homepage */}
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
            
            {/* Dark overlay untuk readability */}
            <div className="fixed inset-0 bg-black/40 z-0" />

            {/* Main Content */}
            <div className="relative z-10 pt-20 pb-8 min-h-screen">
                <div className="container mx-auto px-4">
                    {/* Back Navigation */}
                    <div className="py-6 w-full mb-6">
                        <Link 
                            to="/gedung" 
                            className="inline-flex items-center glass-button text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Daftar Gedung
                        </Link>
                    </div>

                    {/* Building Info Section */}
                    <div className="py-12 w-full mb-8">
                        <div className="glass-panel rounded-2xl p-8 fade-in-up">
                            <div className="mb-8">
                                {/* Building Title Section */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-blue to-purple-600 rounded-2xl mb-6 shadow-2xl">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    
                                    <h1 className="text-4xl md:text-6xl font-[950] text-white mb-4 drop-shadow-2xl leading-tight">
                                        {building?.name || building?.nama || 'Gedung Tidak Ditemukan'}
                                    </h1>
                                    
                                    <div className="flex items-center justify-center text-white/90 text-xl mb-6">
                                        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
                                            <svg className="w-6 h-6 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="font-semibold">
                                                {building?.location || building?.lokasi || 'Lokasi Tidak Diketahui'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <span className="inline-flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-4 py-2 rounded-full border border-green-400/30 font-medium">
                                            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                                            {rooms.length} ruangan tersedia
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Building Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-button p-4 rounded-xl">
                                    <div className="flex items-center text-white/90">
                                        <svg className="w-6 h-6 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-white/60 text-sm">Jam Operasional</p>
                                            <p className="font-semibold">{building?.jam_operasional || building?.operationHours || "Tidak tersedia"}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="glass-button p-4 rounded-xl">
                                    <div className="flex items-center text-white/90">
                                        <svg className="w-6 h-6 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                                        </svg>
                                        <div>
                                            <p className="text-white/60 text-sm">Jumlah Ruangan</p>
                                            <p className="font-semibold">{building?.jumlah_ruangan || rooms.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="glass-button p-4 rounded-xl">
                                    <div className="flex items-center text-white/90">
                                        <svg className="w-6 h-6 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                            <p className="text-white/60 text-sm">Pengelola</p>
                                            <p className="font-semibold">{building?.pengelola || building?.manager || "Tidak tersedia"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className="py-6 w-full mb-6">
                        <h2 className="text-3xl font-[800] text-white text-center">
                            🚪 Daftar Ruangan
                        </h2>
                        <p className="text-white/70 text-center mt-2">
                            Pilih ruangan yang sesuai dengan kebutuhan Anda
                        </p>
                    </div>

                    {/* Room Cards */}
                    {rooms.length > 0 && (
                        <div className="py-12 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rooms.map((room, index) => (
                                        <Link
                                            to={`/reservation/${room.id}`}
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
                                                
                                                <div className="grid grid-cols-2 gap-4">
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
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-white/60">Lantai</p>
                                                                <p className="text-sm font-semibold">{room.floor}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="flex items-center text-white/80">
                                                            <svg className="w-4 h-4 mr-2 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4a1 1 0 011-1h4m12 0h4a1 1 0 011 1v4m0 12v4a1 1 0 01-1 1h-4M4 16v4a1 1 0 001 1h4" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-white/60">Luas</p>
                                                                <p className="text-sm font-semibold">{room.size} m²</p>
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

                                                <div className="mt-6 pt-4 border-t border-white/20">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-white/60 text-sm">Reservasi Sekarang</span>
                                                        <svg className="w-5 h-5 text-primary-yellow group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {rooms.length === 0 && (
                        <div className="py-12 w-full">
                                <div className="glass-panel rounded-xl p-12 text-center fade-in-up">
                                    <div className="text-white/60 mb-6">
                                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Tidak ada ruangan tersedia</h3>
                                    <p className="text-white/70 mb-8">Gedung ini belum memiliki ruangan yang terdaftar dalam sistem</p>
                                    <Link 
                                        to="/gedung"
                                        className="inline-flex items-center glass-button text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Kembali ke Daftar Gedung
                                    </Link>
                                </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Ruangan;