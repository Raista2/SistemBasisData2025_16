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
    const [isVisible, setIsVisible] = useState({});

    // Refs for intersection observer
    const tabsRef = useRef(null);
    const contentRef = useRef(null);

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
                tabs: true,
                content: true
            });
        }, 2000);

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        const elements = [tabsRef.current, contentRef.current];
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
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'canceled':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            default:
                return 'bg-primary-yellow text-primary-blue border border-yellow-200';
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
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'canceled':
                return (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    // Animation classes
    const fadeInUp = `transform transition-all duration-700 ease-out ${
        isVisible.tabs ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-90'
    }`;

    const fadeInLeft = `transform transition-all duration-700 ease-out ${
        isVisible.content ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-90'
    }`;

    const staggeredAnimation = (index, isVisible) => ({
        opacity: isVisible ? 1 : 0.9,
        transform: isVisible ? 'translateY(0px)' : 'translateY(20px)',
        transition: `all 0.6s ease-out ${index * 0.1}s`
    });

    if (loading && reservations.length === 0) {
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
                            Reservasiku
                        </h1>
                        <p className="text-xl font-medium animate-fade-in-up animation-delay-200">
                            Kelola dan pantau status reservasi ruangan Anda
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

            {/* Filter Tabs Section */}
            <div id="tabs" ref={tabsRef} className="relative py-8 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className={`bg-white rounded-lg shadow-xl p-6 ${fadeInUp}`}>
                            <h2 className="text-xl font-qanelas font-[800] mb-4 text-gray-800 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                </svg>
                                Filter Status
                            </h2>
                            
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { key: 'all', label: 'Semua', icon: '📋' },
                                    { key: 'pending', label: 'Menunggu', icon: '⏳' },
                                    { key: 'approved', label: 'Disetujui', icon: '✅' },
                                    { key: 'rejected', label: 'Ditolak', icon: '❌' },
                                    { key: 'canceled', label: 'Dibatalkan', icon: '🚫' }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                            activeTab === tab.key 
                                                ? 'bg-primary-blue text-white shadow-lg' 
                                                : 'text-primary-blue hover:bg-primary-blue hover:text-white border border-primary-blue hover:shadow-md'
                                        }`}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div id="content" ref={contentRef} className="relative py-8 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {reservations.length === 0 ? (
                            <div className={`bg-white rounded-lg shadow-xl p-12 text-center ${fadeInLeft}`}>
                                <div className="flex flex-col items-center">
                                    <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-2xl font-qanelas font-[700] text-gray-600 mb-4">
                                        Tidak ada reservasi
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        {activeTab !== 'all' 
                                            ? `Tidak ada reservasi dengan status "${getStatusText(activeTab)}".`
                                            : 'Anda belum memiliki reservasi.'
                                        }
                                    </p>
                                    <Link 
                                        to="/reservation"
                                        className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-bem-darkblue transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Buat Reservasi Baru
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${fadeInLeft}`}>
                                {reservations.map((reservation, index) => (
                                    <div 
                                        key={reservation.id} 
                                        className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group"
                                        style={staggeredAnimation(index, isVisible.content)}
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-blue to-bem-darkblue text-white">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-qanelas font-[700] mb-1 group-hover:text-primary-yellow transition-colors duration-300">
                                                        {reservation.roomName}
                                                    </h3>
                                                    <p className="text-blue-100 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        {reservation.buildingName}
                                                    </p>
                                                </div>
                                                <span className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(reservation.status)} bg-white bg-opacity-90`}>
                                                    {getStatusIcon(reservation.status)}
                                                    {getStatusText(reservation.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Tanggal
                                                    </p>
                                                    <p className="font-semibold text-gray-800">{formatDate(reservation.date)}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Waktu
                                                    </p>
                                                    <p className="font-semibold text-gray-800">{reservation.startTime} - {reservation.endTime}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1 flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Keperluan
                                                </p>
                                                <p className="font-semibold text-gray-800 truncate" title={reservation.purpose}>
                                                    {reservation.purpose}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                            <button
                                                onClick={() => showReservationDetails(reservation)}
                                                className="flex items-center text-primary-blue hover:text-white hover:bg-primary-blue px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Detail
                                            </button>
                                            {reservation.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelReservation(reservation.id)}
                                                    disabled={cancelLoading === reservation.id}
                                                    className="flex items-center text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50"
                                                >
                                                    {cancelLoading === reservation.id ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Membatalkan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Batalkan
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Reservation Detail Modal */}
            {showDetailModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-primary-blue to-bem-darkblue text-white flex justify-between items-center">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-qanelas font-[700]">Detail Reservasi</h3>
                            </div>
                            <button 
                                onClick={() => setShowDetailModal(false)} 
                                className="text-2xl font-bold hover:text-primary-yellow transition-colors duration-300 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
                            >
                                ×
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            ID Reservasi
                                        </p>
                                        <p className="font-semibold text-gray-800">#{selectedReservation.id}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Status
                                        </p>
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(selectedReservation.status)}`}>
                                            {getStatusIcon(selectedReservation.status)}
                                            {getStatusText(selectedReservation.status)}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Gedung
                                        </p>
                                        <p className="font-semibold text-gray-800">{selectedReservation.buildingName || 'N/A'}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
                                            </svg>
                                            Ruangan
                                        </p>
                                        <p className="font-semibold text-gray-800">{selectedReservation.roomName}</p>
                                    </div>
                                </div>
                                
                                {/* Date & Time Info */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Tanggal Reservasi
                                        </p>
                                        <p className="font-semibold text-gray-800">{formatDate(selectedReservation.date)}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Waktu
                                        </p>
                                        <p className="font-semibold text-gray-800">{selectedReservation.startTime} - {selectedReservation.endTime}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Jumlah Peserta
                                        </p>
                                        <p className="font-semibold text-gray-800">{selectedReservation.attendees} orang</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Tanggal Pengajuan
                                        </p>
                                        <p className="font-semibold text-gray-800">
                                            {selectedReservation.createdAt ? formatDate(selectedReservation.createdAt) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Purpose and Notes */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Keperluan
                                    </p>
                                    <p className="font-semibold text-gray-800">{selectedReservation.purpose}</p>
                                </div>
                                
                                {selectedReservation.notes && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Catatan
                                        </p>
                                        <p className="font-semibold text-gray-800">{selectedReservation.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            {selectedReservation.status === 'pending' && (
                                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleCancelReservation(selectedReservation.id);
                                        }}
                                        className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                        disabled={cancelLoading === selectedReservation.id}
                                    >
                                        {cancelLoading === selectedReservation.id ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Membatalkan...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

                /* Enhanced hover effects */
                .group:hover .group-hover\\:text-primary-yellow {
                    color: #fbbf24;
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
                button:hover:not(:disabled) {
                    transform: translateY(-1px);
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

                /* Modal backdrop blur effect */
                .backdrop-blur-sm {
                    backdrop-filter: blur(4px);
                }

                /* Card scaling animation */
                .hover\\:scale-\\[1\\.02\\]:hover {
                    transform: scale(1.02);
                }

                /* Enhanced shadow effects */
                .shadow-2xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
};

export default MyReservations;