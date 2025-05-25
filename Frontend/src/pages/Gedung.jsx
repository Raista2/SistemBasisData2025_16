import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GedungService from '../services/GedungService';
import bgUI from '../assets/images/bg-ui.png';

const Gedung = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid');
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
        const fetchBuildings = async () => {
            try {
                setLoading(true);
                const data = await GedungService.getAllGedung();
                setBuildings(data);
            } catch (err) {
                setError('Gagal memuat data gedung. Silakan coba lagi nanti.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBuildings();
    }, []);

    // Filter and sort buildings
    const filteredAndSortedBuildings = buildings
        .filter(building => 
            building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (building.location && building.location.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            switch(sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'location':
                    return (a.location || '').localeCompare(b.location || '');
                case 'roomCount':
                    return (b.roomCount || 0) - (a.roomCount || 0);
                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-primary-yellow animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    </div>
                    <p className="text-white font-medium text-lg animate-pulse">Memuat daftar gedung...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-red-900 via-pink-900 to-rose-900">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md mx-4">
                    <div className="text-center">
                        <div className="text-red-300 mb-6">
                            <svg className="w-20 h-20 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-3">Oops!</h3>
                        <p className="text-white/80 mb-6">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                        >
                            Coba Lagi
                        </button>
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

                .building-card {
                    backdrop-filter: blur(15px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .building-card:hover {
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

            {/* Main Content dengan gradient sections seperti homepage */}
            <div className="relative z-10 pt-20 pb-8 min-h-screen">
                <div className="container mx-auto px-4">
                    {/* Header Section dengan gradient background */}
                    <div className="relative py-12 w-full mb-8">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/8 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                        <div className="glass-panel rounded-2xl p-8 relative z-10 fade-in-up">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl md:text-5xl font-[950] text-white mb-4 drop-shadow-lg">
                                    🏢 Daftar Gedung
                                </h1>
                                <p className="text-white/80 text-lg max-w-2xl mx-auto">
                                    Jelajahi berbagai gedung Fakultas Teknik dan temukan ruangan yang sesuai dengan kebutuhan Anda
                                </p>
                            </div>

                            {/* Search and Controls */}
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Search Bar */}
                                <div className="relative flex-1 max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Cari gedung atau lokasi..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 glass-button text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                    <svg className="w-5 h-5 text-white/60 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-3">
                                    {/* Sort Dropdown dengan styling yang fixed */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-3 glass-button text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="name" className="bg-gray-800 text-white">Urutkan: Nama</option>
                                        <option value="location" className="bg-gray-800 text-white">Urutkan: Lokasi</option>
                                        <option value="roomCount" className="bg-gray-800 text-white">Urutkan: Jumlah Ruangan</option>
                                    </select>

                                    {/* View Mode Toggle */}
                                    <div className="flex bg-white/10 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition-all duration-300 ${
                                                viewMode === 'grid' 
                                                    ? 'bg-white/30 text-white' 
                                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-2 rounded transition-all duration-300 ${
                                                viewMode === 'table' 
                                                    ? 'bg-white/30 text-white' 
                                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Counter dengan gradient background */}
                    <div className="relative py-6 w-full mb-6">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent backdrop-blur-sm bg-clip-padding backdrop-filter"></div>
                        <div className="relative z-10">
                            <p className="text-white/80 text-center">
                                Menampilkan <span className="font-bold text-primary-yellow">{filteredAndSortedBuildings.length}</span> dari <span className="font-bold">{buildings.length}</span> gedung
                            </p>
                        </div>
                    </div>

                    {/* Grid View dengan gradient background */}
                    {viewMode === 'grid' && (
                        <div className="relative py-12 w-full">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/6 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                            <div className="relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredAndSortedBuildings.map((building, index) => (
                                        <div
                                            key={building.id}
                                            className="building-card rounded-xl p-6 group stagger-animation"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-primary-blue/30 rounded-lg group-hover:bg-primary-blue/50 transition-colors duration-300">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                                                    {building.roomCount || 0} ruangan
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-yellow transition-colors duration-300">
                                                {building.name}
                                            </h3>
                                            
                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center text-white/70">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm">{building.location || 'Lokasi tidak tersedia'}</span>
                                                </div>
                                                
                                                <div className="flex items-center text-white/70">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm">{building.operationHours || 'Jam operasional tidak tersedia'}</span>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/ruangan/${building.id}`}
                                                className="block w-full text-center py-3 bg-primary-blue/60 hover:bg-primary-blue text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 group-hover:shadow-lg"
                                            >
                                                Lihat Ruangan
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table View dengan gradient background */}
                    {viewMode === 'table' && (
                        <div className="relative py-12 w-full">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/6 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                            <div className="relative z-10">
                                <div className="glass-panel rounded-xl overflow-hidden fade-in-up">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/10 border-b border-white/20">
                                                <tr>
                                                    <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Nama Gedung</th>
                                                    <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Lokasi</th>
                                                    <th className="py-4 px-6 text-center text-sm font-semibold text-white/90">Jumlah Ruangan</th>
                                                    <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Jam Operasional</th>
                                                    <th className="py-4 px-6 text-center text-sm font-semibold text-white/90">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {filteredAndSortedBuildings.map((building, index) => (
                                                    <tr 
                                                        key={building.id} 
                                                        className="hover:bg-white/10 transition-colors duration-300 stagger-animation"
                                                        style={{ animationDelay: `${index * 0.05}s` }}
                                                    >
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center">
                                                                <div className="p-2 bg-primary-blue/30 rounded mr-3">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-white font-medium">{building.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-white/80">{building.location || '-'}</td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className="bg-primary-blue/30 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                {building.roomCount || 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-white/80">{building.operationHours || '-'}</td>
                                                        <td className="py-4 px-6 text-center">
                                                            <Link
                                                                to={`/ruangan/${building.id}`}
                                                                className="glass-button text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300"
                                                            >
                                                                Lihat
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State dengan gradient background */}
                    {filteredAndSortedBuildings.length === 0 && (
                        <div className="relative py-12 w-full">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/6 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                            <div className="relative z-10">
                                <div className="glass-panel rounded-xl p-12 text-center fade-in-up">
                                    <div className="text-white/60 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Tidak ada gedung ditemukan</h3>
                                    <p className="text-white/70">Coba ubah kata kunci pencarian Anda</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Gedung;