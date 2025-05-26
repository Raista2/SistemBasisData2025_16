import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GedungService from '../services/GedungService';
import PeminjamanService from '../services/PeminjamanService';
import RuanganService from '../services/RuanganService';
import bgUI from '../assets/images/bg-ui.png';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalBuildings: 0,
        totalRooms: 0,
        totalReservations: 0,
        pendingReservations: 0
    });
    const [displayStats, setDisplayStats] = useState({
        totalBuildings: 0,
        totalRooms: 0,
        totalReservations: 0,
        pendingReservations: 0
    });
    const [recentReservations, setRecentReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    
    // Refs for intersection observer
    const statsRef = useRef(null);
    const featuresRef = useRef(null);
    const howItWorksRef = useRef(null);
    const backgroundRef = useRef(null);
    
    // Intersection Observer untuk animasi on scroll
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
                stats: true,
                features: true,
                howItWorks: true
            });
        }, 2000);

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        const elements = [statsRef.current, featuresRef.current, howItWorksRef.current];
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
    
    // Counter animation untuk statistics
    useEffect(() => {
        if (isVisible.stats && stats.totalBuildings > 0) {
            const animateCounter = (target, current, setter, duration = 1500) => {
                const increment = target / (duration / 16);
                let currentValue = 0;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= target) {
                        setter(target);
                        clearInterval(timer);
                    } else {
                        setter(Math.floor(currentValue));
                    }
                }, 16);
                
                return timer;
            };

            const timers = [
                animateCounter(stats.totalBuildings, 0, (val) => 
                    setDisplayStats(prev => ({ ...prev, totalBuildings: val }))
                ),
                animateCounter(stats.totalRooms, 0, (val) => 
                    setDisplayStats(prev => ({ ...prev, totalRooms: val }))
                ),
                animateCounter(stats.totalReservations, 0, (val) => 
                    setDisplayStats(prev => ({ ...prev, totalReservations: val }))
                ),
                animateCounter(stats.pendingReservations, 0, (val) => 
                    setDisplayStats(prev => ({ ...prev, pendingReservations: val }))
                )
            ];

            return () => timers.forEach(timer => clearInterval(timer));
        }
    }, [isVisible.stats, stats]);
    
    // Scroll handler untuk parallax
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
    
    // Background styles
    const backgroundStyle = {
        backgroundImage: `url(${bgUI})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'top center',
        backgroundSize: 'cover',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        opacity: 0.3,
        transform: `translateY(${-scrollY * 0.15}px)`
    };
    
    const overlayStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [buildingsData, roomsData, reservationsData] = await Promise.all([
                    GedungService.getAllGedung(),
                    RuanganService.getAllRuangan(),
                    user ? PeminjamanService.getPeminjamanByUser(user.id) : [],
                ]);
                
                const pendingReservations = user 
                    ? reservationsData.filter(r => r.status === 'pending').length 
                    : 0;
                
                setStats({
                    totalBuildings: buildingsData.length,
                    totalRooms: roomsData.length,
                    totalReservations: reservationsData.length,
                    pendingReservations: pendingReservations
                });
                
                if (user && reservationsData.length > 0) {
                    const sortedReservations = [...reservationsData]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5);
                    
                    setRecentReservations(sortedReservations);
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching homepage data:', err);
                setError('Gagal memuat data. Silakan refresh halaman.');
                
                setStats({
                    totalBuildings: 0,
                    totalRooms: 0,
                    totalReservations: 0,
                    pendingReservations: 0
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setStats({
                    totalBuildings: 0,
                    totalRooms: 0,
                    totalReservations: 0,
                    pendingReservations: 0
                });
            }
        }, 10000);
        
        return () => clearTimeout(timeoutId);
    }, [user]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    // CSS classes untuk animasi - dengan fallback visibility
    const fadeInUp = `transform transition-all duration-700 ease-out ${
        isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-90'
    }`;
    
    const fadeInLeft = (delay = 0) => `transform transition-all duration-700 ease-out ${
        isVisible.features ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-90'
    }`;
    
    const fadeInRight = (delay = 0) => `transform transition-all duration-700 ease-out ${
        isVisible.features ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-90'
    }`;

    const staggeredAnimation = (index, isVisible) => ({
        opacity: isVisible ? 1 : 0.9, // Fallback agar tidak completely hidden
        transform: isVisible ? 'translateY(0px)' : 'translateY(20px)', // Reduced movement
        transition: `all 0.6s ease-out ${index * 0.1}s`
    });
            
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

    return (
        <div className="pt-16 min-h-screen font-qanelas overflow-x-hidden">
        {/* Single blur overlay untuk semua section */}
        <div className="fixed inset-0 bg-white/5 backdrop-blur-sm backdrop-filter pointer-events-none z-0"></div>
            {/* Fixed Background */}
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
                    opacity: 1
                }}
            ></div>
                
            {/* Hero Section dengan slide-in animation */}
            <div className="bg-primary-blue text-white py-16 relative overflow-hidden w-full">                
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-qanelas font-[950] mb-4 animate-fade-in-down">
                            Pinjam Ruang FT 2.0
                        </h1>
                        <p className="text-xl mb-8 font-medium animate-fade-in-up animation-delay-200">
                            Sistem peminjaman ruangan Fakultas Teknik yang lebih efisien, cepat, dan mudah digunakan
                        </p>
                        {!user ? (
                            <div className="space-x-4 animate-fade-in-up animation-delay-400">
                                <Link 
                                    to="/login" 
                                    className="bg-white text-primary-blue px-6 py-3 rounded-lg font-semibold border-2 border-primary-blue hover:bg-primary-blue hover:text-white hover:border-primary-yellow transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                                >
                                    Masuk
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-primary-yellow text-primary-blue px-6 py-3 rounded-lg font-semibold border-2 border-primary-blue hover:bg-red-500 hover:text-white hover:border-white transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                                >
                                    Daftar
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4 animate-fade-in-up animation-delay-400">
                                <Link 
                                    to="/reservation" 
                                    className="bg-white text-primary-blue px-6 py-3 rounded-lg font-semibold border-2 border-transparent hover:bg-yellow-400 hover:border-white hover:text-primary-blue transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                                >
                                    Buat Reservasi
                                </Link>
                                <Link 
                                    to="/my-reservations" 
                                    className="bg-primary-yellow text-primary-blue px-6 py-3 rounded-lg font-semibold border-2 border-transparent hover:bg-red-500 hover:border-white hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                                >
                                    Lihat Reservasi Saya
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Statistics section dengan counter animation */}
            <div id="stats" ref={statsRef} className="relative py-12 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {[
                            { value: displayStats.totalBuildings, label: 'Total Gedung' },
                            { value: displayStats.totalRooms, label: 'Total Ruangan' },
                            { value: displayStats.totalReservations, label: 'Total Reservasi' },
                            { value: displayStats.pendingReservations, label: 'Menunggu Persetujuan' }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-lg py-6 px-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform ${fadeInUp}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <span className="text-3xl font-qanelas font-[950] text-primary-blue counter-animation">
                                    {stat.value}
                                </span>
                                <p className="text-gray-600 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features block dengan staggered animation */}
            <div id="features" ref={featuresRef} className="relative py-12 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <h2 className={`text-3xl font-qanelas font-[950] text-center mb-10 text-white ${fadeInUp}`}>
                        Fitur Utama
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                ),
                                title: 'Reservasi Ruangan',
                                description: 'Pesan ruangan untuk kegiatan akademik, rapat, atau acara lainnya dengan mudah dan cepat.',
                                link: '/reservation',
                                linkText: 'Buat Reservasi →'
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                ),
                                title: 'Peta Gedung',
                                description: 'Lihat lokasi gedung di peta interaktif untuk memudahkan pencarian ruangan yang diinginkan.',
                                link: '/map',
                                linkText: 'Lihat Peta →'
                            },
                            {
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: 'Status Reservasi',
                                description: 'Pantau status reservasi Anda, lihat riwayat, dan dapatkan notifikasi ketika disetujui.',
                                link: '/my-reservations',
                                linkText: 'Lihat Status →'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 transform group"
                                style={staggeredAnimation(index, isVisible.features)}
                            >
                                <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">{feature.title}</h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>
                                <Link 
                                    to={feature.link} 
                                    className="text-primary-blue hover:text-white hover:bg-primary-blue font-medium transition-all duration-300 px-3 py-1 rounded-md hover:shadow-md"
                                >
                                    {feature.linkText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Reservations dengan slide-in animation */}
            {user && recentReservations.length > 0 && (
                <div className="relative py-12 w-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                    <div className="w-full px-4 relative z-10">
                        <h2 className="text-2xl font-qanelas font-[800] mb-6 text-white text-center animate-fade-in-up">
                            Reservasi Terbaru
                        </h2>
                        
                        <div className="overflow-hidden rounded-lg shadow-lg max-w-6xl mx-auto animate-fade-in-up animation-delay-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-black">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left">Ruangan</th>
                                            <th className="py-3 px-4 text-left">Tanggal</th>
                                            <th className="py-3 px-4 text-left">Waktu</th>
                                            <th className="py-3 px-4 text-left">Status</th>
                                            <th className="py-3 px-4 text-left">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {recentReservations.map((reservation, index) => (
                                            <tr 
                                                key={reservation.id} 
                                                className="border-t hover:bg-gray-50 transition-colors duration-200 animate-slide-in-left"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{reservation.roomName}</div>
                                                    <div className="text-sm text-gray-500">{reservation.buildingName}</div>
                                                </td>
                                                <td className="py-3 px-4">{formatDate(reservation.date)}</td>
                                                <td className="py-3 px-4">{reservation.startTime} - {reservation.endTime}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-300 hover:scale-105 ${
                                                        reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        reservation.status === 'canceled' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {reservation.status === 'approved' ? 'Disetujui' :
                                                         reservation.status === 'rejected' ? 'Ditolak' :
                                                         reservation.status === 'canceled' ? 'Dibatalkan' :
                                                         'Menunggu'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button 
                                                        onClick={() => navigate(`/my-reservations`)}
                                                        className="text-primary-blue hover:text-primary-darkblue transition-colors duration-300 hover:underline"
                                                    >
                                                        Detail
                                                    </button>
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

            {/* How It Works dengan staggered card animation */}
            <div id="howItWorks" ref={howItWorksRef} className="relative py-12 w-full">
                <div style={backgroundStyle}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <h2 className={`text-3xl font-[950] text-center mb-10 text-white ${fadeInUp}`}>
                        Cara Kerja
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                step: 1,
                                title: 'Pilih Gedung & Ruangan',
                                description: 'Pilih gedung dan ruangan yang sesuai dengan kebutuhan Anda dari daftar yang tersedia.'
                            },
                            {
                                step: 2,
                                title: 'Isi Form Reservasi',
                                description: 'Isi form reservasi dengan tanggal, waktu, jumlah peserta, dan keperluan peminjaman.'
                            },
                            {
                                step: 3,
                                title: 'Tunggu Persetujuan',
                                description: 'Admin akan memeriksa dan menyetujui reservasi Anda dalam waktu singkat.'
                            },
                            {
                                step: 4,
                                title: 'Gunakan Ruangan',
                                description: 'Setelah disetujui, Anda dapat menggunakan ruangan sesuai dengan jadwal yang telah dipesan.'
                            }
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="bg-primary-blue bg-opacity-90 text-white p-6 rounded-lg relative text-center hover:bg-opacity-100 transition-all duration-500 hover:scale-105 transform group"
                                style={staggeredAnimation(index, isVisible.howItWorks)}
                            >
                                <div className="absolute -top-4 -right-4 bg-primary-yellow text-primary-blue w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action dengan pulse animation */}
            <div className="bg-primary-blue text-white py-12 relative overflow-hidden w-full">               
                <div className="w-full px-4 text-center relative z-10">
                    <h2 className="text-3xl font-qanelas font-[950] mb-4 animate-fade-in-up">
                        Siap untuk membuat reservasi?
                    </h2>
                    <p className="text-xl mb-6 animate-fade-in-up animation-delay-200">
                        Mulai pesan ruangan sekarang dan manfaatkan fasilitas kampus dengan optimal
                    </p>
                    <Link 
                        to={user ? "/reservation" : "/login"} 
                        className="bg-primary-yellow text-primary-blue px-6 py-3 rounded-lg font-semibold border-2 border-transparent hover:bg-red-500 hover:border-white hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                    >
                        {user ? "Buat Reservasi Sekarang" : "Masuk untuk Mulai"}
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-primary-yellow text-primary-blue py-8 w-full relative z-20">
                <div className="w-full px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-qanelas font-[950]">Pinjam Ruang FT 2.0</h3>
                            <p className="text-primary-blue">Sistem Reservasi Ruangan Fakultas Teknik</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            <Link to="/map" className="hover:text-primary-darkblue transition-colors duration-300 hover:underline">Peta Gedung</Link>
                            <Link to="/gedung" className="hover:text-primary-darkblue transition-colors duration-300 hover:underline">Daftar Gedung</Link>
                            <Link to="/reservation" className="hover:text-primary-darkblue transition-colors duration-300 hover:underline">Reservasi</Link>
                            {user && <Link to="/my-reservations" className="hover:text-primary-darkblue transition-colors duration-300 hover:underline">Reservasiku</Link>}
                        </div>
                    </div>
                    <div className="border-t border-primary-blue mt-6 pt-6 text-center max-w-6xl mx-auto">
                        <p>&copy; {new Date().getFullYear()} Pinjam Ruang FT 2.0. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Custom CSS untuk animasi */}
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

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes pulseGentle {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.02);
                    }
                }

                .animate-fade-in-down {
                    animation: fadeInDown 0.8s ease-out;
                }

                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out;
                }

                .animate-slide-in-left {
                    animation: slideInLeft 0.6s ease-out;
                }

                .animate-pulse-gentle {
                    animation: pulseGentle 3s ease-in-out infinite;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }

                /* Counter animation styling */
                .counter-animation {
                    transition: all 0.3s ease;
                }

                /* Reduced motion untuk aksesibilitas */
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
            `}</style>
        </div>
    );
};

export default HomePage;