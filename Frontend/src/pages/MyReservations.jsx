import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PeminjamanService from '../services/PeminjamanService';
import bgUI from '../assets/images/bg-ui.png';

const MyReservations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(null);
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
        // Redirect if not logged in
        if (!user) {
            navigate('/login', { state: { from: '/my-reservations' } });
            return;
        }

        fetchReservations();
    }, [user, navigate, activeTab]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const data = await PeminjamanService.getPeminjamanByUser(user.id);
            
            // Filter based on active tab
            const filteredData = activeTab === 'all' 
                ? data 
                : data.filter(reservation => reservation.status === activeTab);
            
            setReservations(filteredData);
            setError(null);
        } catch (err) {
            console.error('Error fetching reservations:', err);
            setError('Gagal memuat daftar reservasi. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (id) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) {
            return;
        }

        try {
            setCancelLoading(id);
            await PeminjamanService.updatePeminjamanStatus(id, 'canceled', 'Dibatalkan oleh pengguna');
            
            // Close modal if open
            if (showDetailModal) {
                setShowDetailModal(false);
            }
            
            // Refresh data
            await fetchReservations();
        } catch (err) {
            console.error('Error canceling reservation:', err);
            alert('Gagal membatalkan reservasi. Silakan coba lagi.');
        } finally {
            setCancelLoading(null);
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
                return 'bg-green-500/20 text-green-400 border-green-400/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-400 border-red-400/30';
            case 'canceled':
                return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
            default:
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            case 'canceled':
                return 'Dibatalkan';
            default:
                return 'Menunggu';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'canceled':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

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

                .glass-button.active {
                    background: rgba(255, 255, 255, 0.3);
                    border-color: rgba(255, 255, 255, 0.4);
                }

                .reservation-card {
                    backdrop-filter: blur(15px);
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .reservation-card:hover {
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

                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: rgb(239, 68, 68);
                }

                .modal-backdrop {
                    backdrop-filter: blur(10px);
                    background: rgba(0, 0, 0, 0.5);
                }

                .modal-content {
                    backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.3);
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
                    {/* Page Header */}
                    <div className="py-12 w-full mb-8">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-[950] text-white mb-4 drop-shadow-lg">
                                Reservasiku
                            </h1>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto">
                                Kelola dan pantau status reservasi ruangan Anda
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

                    {/* Filter Tabs */}
                    <div className="py-8 w-full mb-8">
                        <div className="glass-panel rounded-2xl p-8 fade-in-up">
                            <div className="flex items-center mb-6">
                                <div className="p-3 bg-primary-blue/30 rounded-xl mr-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-[800] text-white">Filter Status</h2>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    { key: 'all', label: 'Semua', icon: '📄' },
                                    { key: 'pending', label: 'Menunggu', icon: '⏳' },
                                    { key: 'approved', label: 'Disetujui', icon: '✅' },
                                    { key: 'rejected', label: 'Ditolak', icon: '❌' },
                                    { key: 'canceled', label: 'Dibatalkan', icon: '⚫' }
                                ].map((tab, index) => (
                                    <button
                                        key={tab.key}
                                        className={`glass-button text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300 flex items-center stagger-animation ${
                                            activeTab === tab.key ? 'active' : ''
                                        }`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reservations Content */}
                    {reservations.length === 0 ? (
                        /* Empty State */
                        <div className="py-12 w-full">
                            <div className="glass-panel rounded-xl p-12 text-center fade-in-up">
                                <div className="text-white/60 mb-6">
                                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Tidak ada reservasi {activeTab !== 'all' ? `dengan status "${getStatusText(activeTab)}"` : ''}
                                </h3>
                                <p className="text-white/70 mb-8">
                                    {activeTab === 'all' 
                                        ? 'Anda belum memiliki reservasi apapun. Mulai buat reservasi ruangan sekarang!'
                                        : 'Tidak ada reservasi yang sesuai dengan filter yang dipilih.'
                                    }
                                </p>
                                <Link 
                                    to="/gedung"
                                    className="inline-flex items-center glass-button text-white px-8 py-4 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Buat Reservasi Baru
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Reservations Grid */
                        <div className="py-12 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reservations.map((reservation, index) => (
                                    <div
                                        key={reservation.id}
                                        className="reservation-card rounded-xl overflow-hidden group stagger-animation"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 border-b border-white/20">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-primary-yellow transition-colors duration-300">
                                                        🏠 {reservation.roomName}
                                                    </h3>
                                                    <p className="text-white/80">{reservation.buildingName}</p>
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(reservation.status)}`}>
                                                    {getStatusIcon(reservation.status)}
                                                    <span className="ml-1">{getStatusText(reservation.status)}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            <div className="space-y-4 mb-6">
                                                <div className="flex items-center text-white/80">
                                                    <svg className="w-4 h-4 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2m-6 0V7" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs text-white/60">Tanggal</p>
                                                        <p className="font-semibold">{formatDate(reservation.date)}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center text-white/80">
                                                    <svg className="w-4 h-4 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs text-white/60">Waktu</p>
                                                        <p className="font-semibold">{reservation.startTime} - {reservation.endTime}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center text-white/80">
                                                    <svg className="w-4 h-4 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-white/60">Keperluan</p>
                                                        <p className="font-semibold truncate">{reservation.purpose}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Actions */}
                                            <div className="flex justify-between gap-3">
                                                <button
                                                    onClick={() => showReservationDetails(reservation)}
                                                    className="flex-1 glass-button text-white py-2 px-4 rounded-lg font-medium hover:scale-105 transition-all duration-300 text-center"
                                                >
                                                    Lihat Detail
                                                </button>
                                                {reservation.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelReservation(reservation.id)}
                                                        disabled={cancelLoading === reservation.id}
                                                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400/30 py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                                    >
                                                        {cancelLoading === reservation.id ? (
                                                            <div className="flex items-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400/30 border-t-red-400 mr-2"></div>
                                                                Loading...
                                                            </div>
                                                        ) : (
                                                            'Batalkan'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Reservation Detail Modal */}
                    {showDetailModal && selectedReservation && (
                        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
                            <div className="modal-content rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                                {/* Modal Header */}
                                <div className="px-6 py-4 bg-gradient-to-r from-primary-blue to-primary-blue/80 text-white flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold">Detail Reservasi</h3>
                                    </div>
                                    <button 
                                        onClick={() => setShowDetailModal(false)} 
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 max-h-[70vh] overflow-y-auto text-gray-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">ID Reservasi</p>
                                                <p className="text-lg font-semibold text-gray-800">{selectedReservation.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Gedung</p>
                                                <p className="text-lg font-semibold text-gray-800">{selectedReservation.buildingName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Tanggal</p>
                                                <p className="text-lg font-semibold text-gray-800">{formatDate(selectedReservation.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Jumlah Peserta</p>
                                                <p className="text-lg font-semibold text-gray-800">{selectedReservation.attendees} orang</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Status</p>
                                                <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeClass(selectedReservation.status)}`}>
                                                    {getStatusIcon(selectedReservation.status)}
                                                    <span className="ml-1">{getStatusText(selectedReservation.status)}</span>
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Ruangan</p>
                                                <p className="text-lg font-semibold text-gray-800">{selectedReservation.roomName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Waktu</p>
                                                <p className="text-lg font-semibold text-gray-800">{selectedReservation.startTime} - {selectedReservation.endTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Tanggal Pengajuan</p>
                                                <p className="text-lg font-semibold text-gray-800">
                                                    {selectedReservation.createdAt ? formatDate(selectedReservation.createdAt) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 font-medium mb-2">Keperluan</p>
                                        <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedReservation.purpose}</p>
                                    </div>
                                    
                                    {selectedReservation.notes && (
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-500 font-medium mb-2">Catatan</p>
                                            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedReservation.notes}</p>
                                        </div>
                                    )}

                                    {selectedReservation.status === 'pending' && (
                                        <div className="flex justify-end pt-6 border-t">
                                            <button
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    handleCancelReservation(selectedReservation.id);
                                                }}
                                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
                                                disabled={cancelLoading === selectedReservation.id}
                                            >
                                                {cancelLoading === selectedReservation.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                                                        Membatalkan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Batalkan Reservasi
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyReservations;