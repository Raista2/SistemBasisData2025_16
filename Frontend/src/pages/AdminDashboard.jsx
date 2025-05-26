import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PeminjamanService from '../services/PeminjamanService';
import ApprovalLogService from '../services/ApprovalLogService';
import bgFTUI from '../assets/images/bg-ftui.png';
import bgUI from '../assets/images/bg-ui.png';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('pending');
    const [reservations, setReservations] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logLoading, setLogLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    
    // Animation states (same as HomePage)
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    const [displayStats, setDisplayStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    // Animation refs
    const statsRef = useRef(null);
    const tableRef = useRef(null);
    const backgroundRef = useRef(null);

    // Intersection Observer for animations (same as HomePage)
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

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        const elements = [statsRef.current, tableRef.current].filter(Boolean);
        elements.forEach(el => observer.observe(el));

        // Fallback for visibility
        const fallbackTimer = setTimeout(() => {
            setIsVisible({ stats: true, table: true });
        }, 1000);

        return () => {
            observer.disconnect();
            clearTimeout(fallbackTimer);
        };
    }, []);

    // Parallax scroll effect (same as HomePage)
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
        };
        
        const throttledScroll = throttle(handleScroll, 16);
        window.addEventListener('scroll', throttledScroll);
        handleScroll();
        
        return () => window.removeEventListener('scroll', throttledScroll);
    }, []);

    // Throttle function for performance (same as HomePage)
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

    // Counter animation for stats (same as HomePage)
    useEffect(() => {
        if (isVisible.stats && reservations.length > 0) {
            const stats = {
                total: reservations.length,
                pending: reservations.filter(r => r.status === 'pending').length,
                approved: reservations.filter(r => r.status === 'approved').length,
                rejected: reservations.filter(r => r.status === 'rejected').length
            };

            const animateCounter = (target, setter, duration = 1500) => {
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
                animateCounter(stats.total, (val) => 
                    setDisplayStats(prev => ({ ...prev, total: val }))
                ),
                animateCounter(stats.pending, (val) => 
                    setDisplayStats(prev => ({ ...prev, pending: val }))
                ),
                animateCounter(stats.approved, (val) => 
                    setDisplayStats(prev => ({ ...prev, approved: val }))
                ),
                animateCounter(stats.rejected, (val) => 
                    setDisplayStats(prev => ({ ...prev, rejected: val }))
                )
            ];

            return () => timers.forEach(timer => clearInterval(timer));
        }
    }, [isVisible.stats, reservations]);

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: '/admin/dashboard' } });
            return;
        }

        fetchReservations(activeTab);
    }, [user, navigate, activeTab]);

    const fetchReservations = async (status) => {
        try {
            setLoading(true);
            let data;

            if (status === 'all') {
                data = await PeminjamanService.getAllPeminjaman();
            } else {
                data = await PeminjamanService.getPeminjamanByStatus(status);
            }

            setReservations(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Gagal memuat data reservasi. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const fetchApprovalLogs = async (reservationId) => {
        try {
            setLogLoading(true);
            const logsData = await ApprovalLogService.getApprovalLogsByPeminjaman(reservationId);
            setLogs(logsData);
            setShowLogModal(true);
        } catch (error) {
            console.error('Error fetching approval logs:', error);
            alert('Gagal memuat riwayat persetujuan');
        } finally {
            setLogLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            setActionLoading(id);

            const notes = action === 'approved'
                ? 'Reservasi disetujui oleh admin'
                : 'Reservasi ditolak oleh admin';

            await PeminjamanService.updatePeminjamanStatus(id, action, notes);

            // Refresh data
            await fetchReservations(activeTab);
        } catch (err) {
            console.error(`Error updating reservation status to ${action}:`, err);
            alert(`Gagal ${action === 'approved' ? 'menyetujui' : 'menolak'} reservasi. Silakan coba lagi.`);
        } finally {
            setActionLoading(null);
        }
    };

    const showReservationDetails = (reservation) => {
        setSelectedReservation(reservation);
        setShowDetailModal(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            default:
                return 'Menunggu';
        }
    };

    // Animation CSS classes (same as HomePage)
    const fadeInUp = `transform transition-all duration-700 ease-out ${
        isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-90'
    }`;

    const staggeredAnimation = (index, isVisible) => ({
        opacity: isVisible ? 1 : 0.9,
        transform: isVisible ? 'translateY(0px)' : 'translateY(20px)',
        transition: `all 0.6s ease-out ${index * 0.1}s`
    });

    if (loading && reservations.length === 0) {
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
            {/* Single blur overlay for all sections - SAME AS HOMEPAGE */}
            <div className="fixed inset-0 bg-white/5 backdrop-blur-sm backdrop-filter pointer-events-none z-0"></div>
            
            {/* Fixed Background - EXACTLY SAME AS HOMEPAGE */}
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

            {/* Hero Section - SAME STRUCTURE AS HOMEPAGE */}
            <div className="bg-primary-blue text-white py-16 relative overflow-hidden w-full">                
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                            <div className="animate-fade-in-down">
                                <h1 className="text-4xl md:text-5xl font-qanelas font-[950] mb-4">
                                    Dashboard Admin
                                </h1>
                                <p className="text-xl mb-8 font-medium animate-fade-in-up animation-delay-200">
                                    Kelola reservasi ruangan dengan efisien
                                </p>
                            </div>
                            <div className="space-x-4 animate-fade-in-up animation-delay-400">
                                <button
                                    className="bg-white text-primary-blue px-6 py-3 rounded-lg font-semibold border-2 border-primary-blue hover:bg-primary-blue hover:text-white hover:border-primary-yellow transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                                    onClick={() => navigate('/gedung')}
                                >
                                    Kelola Gedung
                                </button>
                            </div>
                        </div>

                        {/* Stats Section - EXACTLY SAME LAYOUT AS HOMEPAGE */}
                        <div id="stats" ref={statsRef} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { value: displayStats.total, label: 'Total Reservasi' },
                                { value: displayStats.pending, label: 'Menunggu Persetujuan' },
                                { value: displayStats.approved, label: 'Disetujui' },
                                { value: displayStats.rejected, label: 'Ditolak' }
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
            </div>

            {/* Main Content Area - SAME BACKGROUND TREATMENT AS HOMEPAGE */}
            <div className="relative py-12 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        {/* Tabs - SAME STYLING AS HOMEPAGE */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="flex flex-wrap -mb-px">
                                <button
                                    className={`py-4 px-6 font-medium text-sm transition-colors hover:bg-primary-blue hover:text-white rounded-t ${activeTab === 'pending'
                                            ? 'bg-primary-blue text-white'
                                            : 'text-primary-blue bg-white border-black hover:bg-primary-blue hover:text-white'}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Menunggu Persetujuan
                                </button>
                                <button
                                    className={`py-4 px-6 font-medium text-sm transition-colors hover:bg-primary-blue hover:text-white rounded-t ${activeTab === 'approved'
                                            ? 'bg-primary-blue text-white'
                                            : 'text-primary-blue bg-white border-black hover:bg-primary-blue hover:text-white'}`}
                                    onClick={() => setActiveTab('approved')}
                                >
                                    Disetujui
                                </button>
                                <button
                                    className={`py-4 px-6 font-medium text-sm transition-colors hover:bg-primary-blue hover:text-white rounded-t ${activeTab === 'rejected'
                                            ? 'bg-primary-blue text-white'
                                            : 'text-primary-blue bg-white border-black hover:bg-primary-blue hover:text-white'}`}
                                    onClick={() => setActiveTab('rejected')}
                                >
                                    Ditolak
                                </button>
                                <button
                                    className={`py-4 px-6 font-medium text-sm transition-colors hover:bg-primary-blue hover:text-white rounded-t ${activeTab === 'all'
                                            ? 'bg-primary-blue text-white'
                                            : 'text-primary-blue bg-white border-black hover:bg-primary-blue hover:text-white'}`}
                                    onClick={() => setActiveTab('all')}
                                >
                                    Semua Reservasi
                                </button>
                            </nav>
                        </div>

                        {/* Reservations Table */}
                        {reservations.length === 0 ? (
                            <div className="bg-gray-50 p-8 rounded-lg text-center">
                                <p className="text-gray-600">
                                    Tidak ada data reservasi {activeTab !== 'all' ? `dengan status "${activeTab}"` : ''}.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pemohon
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ruangan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal & Waktu
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reservations.map((reservation) => (
                                            <tr key={reservation.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {reservation.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {reservation.userName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {reservation.roomName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>{formatDate(reservation.date)}</div>
                                                    <div className="text-gray-500">
                                                        {reservation.startTime} - {reservation.endTime}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                                                        {getStatusText(reservation.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-4">
                                                        <button
                                                            onClick={() => showReservationDetails(reservation)}
                                                            className="text-primary-white hover:bg-primary-yellow hover:text-blue py-1 px-2 rounded transition-colors"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => fetchApprovalLogs(reservation.id)}
                                                            className="text-primary-white hover:bg-primary-yellow hover:text-blue py-1 px-2 rounded transition-colors"
                                                        >
                                                            Log
                                                        </button>
                                                        {reservation.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(reservation.id, 'approved')}
                                                                    disabled={actionLoading === reservation.id}
                                                                    className="text-green-600 hover:bg-green-600 hover:text-white py-1 px-2 rounded transition-colors"
                                                                >
                                                                    {actionLoading === reservation.id ? '...' : 'Setujui'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(reservation.id, 'rejected')}
                                                                    disabled={actionLoading === reservation.id}
                                                                    className="text-red-600 hover:bg-red-600 hover:text-white py-1 px-2 rounded transition-colors"
                                                                >
                                                                    {actionLoading === reservation.id ? '...' : 'Tolak'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section - SAME BACKGROUND TREATMENT AS HOMEPAGE */}
            <div className="relative py-12 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${bgFTUI})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-qanelas font-[950] mb-10 text-white text-center animate-fade-in-up">Fitur Utama</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">Manajemen Reservasi</h3>
                                <p className="text-gray-600 mb-4">Kelola semua permintaan reservasi dengan mudah. Setujui atau tolak dengan cepat.</p>
                            </div>

                            <div className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">Riwayat Persetujuan</h3>
                                <p className="text-gray-600 mb-4">Lihat perubahan status dan catatan untuk setiap reservasi yang telah diproses.</p>
                            </div>

                            <div className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">Statistik Penggunaan</h3>
                                <p className="text-gray-600 mb-4">Pantau statistik reservasi dan tingkat penggunaan ruangan dengan mudah.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservation Detail Modal */}
            {showDetailModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-primary-blue text-white flex justify-between items-center">
                            <h3 className="text-lg font-[800]">Detail Reservasi</h3>
                            <button onClick={() => setShowDetailModal(false)} className="focus:outline-none text-2xl">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">ID Reservasi</p>
                                    <p className="font-medium">{selectedReservation.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedReservation.status)}`}>
                                        {getStatusText(selectedReservation.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Nama Pemohon</p>
                                    <p className="font-medium">{selectedReservation.userName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Pemohon</p>
                                    <p className="font-medium">{selectedReservation.userEmail || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gedung</p>
                                    <p className="font-medium">{selectedReservation.buildingName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ruangan</p>
                                    <p className="font-medium">{selectedReservation.roomName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{formatDate(selectedReservation.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Waktu</p>
                                    <p className="font-medium">{selectedReservation.startTime} - {selectedReservation.endTime}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Jumlah Peserta</p>
                                    <p className="font-medium">{selectedReservation.attendees} orang</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Pengajuan</p>
                                    <p className="font-medium">
                                        {selectedReservation.createdAt ? formatDate(selectedReservation.createdAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Keperluan</p>
                                <p className="font-medium">{selectedReservation.purpose}</p>
                            </div>

                            {selectedReservation.notes && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Catatan</p>
                                    <p className="font-medium">{selectedReservation.notes}</p>
                                </div>
                            )}

                            {selectedReservation.status === 'pending' && (
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleAction(selectedReservation.id, 'rejected');
                                        }}
                                        className="text-red-600 hover:bg-red-600 hover:text-white py-2 px-4 rounded transition-colors"
                                        disabled={actionLoading === selectedReservation.id}
                                    >
                                        {actionLoading === selectedReservation.id ? 'Memproses...' : 'Tolak'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleAction(selectedReservation.id, 'approved');
                                        }}
                                        className="text-green-600 hover:bg-green-600 hover:text-white py-2 px-4 rounded transition-colors"
                                        disabled={actionLoading === selectedReservation.id}
                                    >
                                        {actionLoading === selectedReservation.id ? 'Memproses...' : 'Setujui'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Log Modal */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-primary-blue text-white flex justify-between items-center">
                            <h3 className="text-lg font-[800]">Riwayat Persetujuan</h3>
                            <button onClick={() => setShowLogModal(false)} className="focus:outline-none text-2xl">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {logLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                                </div>
                            ) : logs.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Belum ada riwayat persetujuan</p>
                            ) : (
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="border-l-4 border-primary-blue pl-4 py-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{log.adminName}</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <span className="text-sm">
                                                    Status diubah dari <span className={`${getStatusBadgeClass(log.previousStatus)} px-1 rounded`}>{getStatusText(log.previousStatus)}</span> menjadi <span className={`${getStatusBadgeClass(log.newStatus)} px-1 rounded`}>{getStatusText(log.newStatus)}</span>
                                                </span>
                                            </div>
                                            {log.notes && (
                                                <div className="mt-1 text-sm text-gray-600">
                                                    Catatan: {log.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS - SAME AS HOMEPAGE */}
            <style jsx>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes pulseGentle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }

                .animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
                .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
                .animate-slide-in-left { animation: slideInLeft 0.6s ease-out; }
                .animate-pulse-gentle { animation: pulseGentle 3s ease-in-out infinite; }

                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }

                .counter-animation { transition: all 0.3s ease; }

                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;