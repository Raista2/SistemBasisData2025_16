import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PeminjamanService from '../services/PeminjamanService';
import bgUI from '../assets/images/bg-ui.png';

const Approval = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
    const [actionLoading, setActionLoading] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const backgroundRef = useRef(null);

    // Parallax scroll handler (same as Gedung)
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

    // Throttle function for performance (same as Gedung)
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
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: '/approval' } });
            return;
        }

        const fetchReservations = async () => {
            try {
                setLoading(true);
                let data;

                // Fetch reservations based on filter
                if (filter === 'all') {
                    data = await PeminjamanService.getAllPeminjaman();
                } else {
                    data = await PeminjamanService.getPeminjamanByStatus(filter);
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

        fetchReservations();
    }, [user, navigate, filter]);

    const handleAction = async (id, action) => {
        try {
            setActionLoading(id);
            const notes = action === 'approved' 
                ? 'Reservasi disetujui oleh admin' 
                : 'Reservasi ditolak oleh admin';
                
            await PeminjamanService.updatePeminjamanStatus(id, action, notes);
            
            // Refresh data
            if (filter === 'all') {
                const updatedData = await PeminjamanService.getAllPeminjaman();
                setReservations(updatedData);
            } else {
                const updatedData = await PeminjamanService.getPeminjamanByStatus(filter);
                setReservations(updatedData);
            }
        } catch (err) {
            console.error(`Error updating reservation status to ${action}:`, err);
            alert(`Gagal ${action === 'approved' ? 'menyetujui' : 'menolak'} reservasi. Silakan coba lagi.`);
        } finally {
            setActionLoading(null);
        }
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
                return 'bg-green-500/30 text-green-100 border border-green-400/50';
            case 'rejected':
                return 'bg-red-500/30 text-red-100 border border-red-400/50';
            case 'pending':
                return 'bg-yellow-500/30 text-yellow-100 border border-yellow-400/50';
            default:
                return 'bg-gray-500/30 text-gray-100 border border-gray-400/50';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            case 'pending':
                return 'Menunggu';
            default:
                return 'Unknown';
        }
    };
            
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

    if (error) {
        return (
            <div className="fixed inset-0 pt-16 flex justify-center items-center bg-gradient-to-br from-red-900 via-pink-900 to-rose-900">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md mx-4">
                    <div className="text-center">
                        <div className="text-red-300 mb-6">
                            <svg className="w-20 h-20 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
            {/* Custom CSS - Same as Gedung */}
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
                    background: rgba(59, 130, 246, 0.6);
                    border-color: rgba(59, 130, 246, 0.8);
                }

                .action-button {
                    backdrop-filter: blur(8px);
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .action-button:hover {
                    transform: translateY(-1px) scale(1.05);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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

            {/* Background with parallax - Same as Gedung */}
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

            {/* Main Content - Same structure as Gedung */}
            <div className="relative z-10 pt-20 pb-8 min-h-screen">
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="py-12 w-full mb-8">
                        <div className="glass-panel rounded-2xl p-8 fade-in-up">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl md:text-5xl font-[950] text-white mb-4 drop-shadow-lg">
                                    Persetujuan Reservasi
                                </h1>
                                <p className="text-white/80 text-lg max-w-2xl mx-auto">
                                    Kelola dan setujui permintaan reservasi ruangan dari pengguna dengan efisien
                                </p>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex flex-wrap justify-center gap-4">
                                {[
                                    { key: 'pending', label: 'Menunggu', icon: '⏳' },
                                    { key: 'approved', label: 'Disetujui', icon: '✅' },
                                    { key: 'rejected', label: 'Ditolak', icon: '❌' },
                                    { key: 'all', label: 'Semua', icon: '📋' }
                                ].map((filterOption) => (
                                    <button
                                        key={filterOption.key}
                                        className={`glass-button px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                                            filter === filterOption.key ? 'active' : ''
                                        }`}
                                        onClick={() => setFilter(filterOption.key)}
                                    >
                                        <span>{filterOption.icon}</span>
                                        {filterOption.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div className="py-6 w-full mb-6">
                        <p className="text-white/80 text-center">
                            Menampilkan <span className="font-bold text-primary-yellow">{reservations.length}</span> reservasi
                            {filter !== 'all' && (
                                <span> dengan status <span className="font-bold text-primary-yellow">{filter}</span></span>
                            )}
                        </p>
                    </div>

                    {/* Reservations Table */}
                    {reservations.length === 0 ? (
                        <div className="py-12 w-full">
                            <div className="glass-panel rounded-xl p-12 text-center fade-in-up">
                                <div className="text-white/60 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Tidak ada reservasi ditemukan</h3>
                                <p className="text-white/70">
                                    Tidak ada data reservasi {filter !== 'all' ? `dengan status "${filter}"` : ''}.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 w-full">
                            <div className="glass-panel rounded-xl overflow-hidden fade-in-up">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/10 border-b border-white/20">
                                            <tr>
                                                <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">ID</th>
                                                <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Nama</th>
                                                <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Ruangan</th>
                                                <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Tanggal</th>
                                                <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Waktu</th>
                                                <th className="py-4 px-6 text-left text-sm font-semibold text-white/90">Keperluan</th>
                                                <th className="py-4 px-6 text-center text-sm font-semibold text-white/90">Peserta</th>
                                                <th className="py-4 px-6 text-center text-sm font-semibold text-white/90">Status</th>
                                                <th className="py-4 px-6 text-center text-sm font-semibold text-white/90">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {reservations.map((reservation, index) => (
                                                <tr 
                                                    key={reservation.id} 
                                                    className="hover:bg-white/10 transition-colors duration-300 stagger-animation"
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <td className="py-4 px-6">
                                                        <span className="text-white/90 font-mono text-sm">
                                                            #{reservation.id}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center">
                                                            <div className="p-2 bg-primary-blue/30 rounded mr-3">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-white font-medium">{reservation.userName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="text-white/90">
                                                            <div className="font-medium">{reservation.roomName}</div>
                                                            <div className="text-sm text-white/60">{reservation.buildingName}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-white/80">
                                                        {formatDate(reservation.date)}
                                                    </td>
                                                    <td className="py-4 px-6 text-white/80">
                                                        <div className="text-sm">
                                                            {reservation.startTime} - {reservation.endTime}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-white/80 max-w-xs">
                                                        <div className="truncate" title={reservation.purpose}>
                                                            {reservation.purpose}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="bg-primary-blue/30 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                            {reservation.attendees}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(reservation.status)}`}>
                                                            {getStatusText(reservation.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        {reservation.status === 'pending' ? (
                                                            <div className="flex justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleAction(reservation.id, 'approved')}
                                                                    disabled={actionLoading === reservation.id}
                                                                    className="action-button bg-green-500/60 hover:bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {actionLoading === reservation.id ? '⏳' : '✅'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(reservation.id, 'rejected')}
                                                                    disabled={actionLoading === reservation.id}
                                                                    className="action-button bg-red-500/60 hover:bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {actionLoading === reservation.id ? '⏳' : '❌'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-white/50 text-sm font-medium">
                                                                Selesai
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="py-8 w-full">
                        <div className="glass-panel rounded-xl p-6 fade-in-up">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-4">
                                    <div className="text-2xl font-bold text-white mb-2">
                                        {reservations.filter(r => r.status === 'pending').length}
                                    </div>
                                    <div className="text-white/70 text-sm">Menunggu</div>
                                </div>
                                <div className="p-4">
                                    <div className="text-2xl font-bold text-green-400 mb-2">
                                        {reservations.filter(r => r.status === 'approved').length}
                                    </div>
                                    <div className="text-white/70 text-sm">Disetujui</div>
                                </div>
                                <div className="p-4">
                                    <div className="text-2xl font-bold text-red-400 mb-2">
                                        {reservations.filter(r => r.status === 'rejected').length}
                                    </div>
                                    <div className="text-white/70 text-sm">Ditolak</div>
                                </div>
                                <div className="p-4">
                                    <div className="text-2xl font-bold text-blue-400 mb-2">
                                        {reservations.length}
                                    </div>
                                    <div className="text-white/70 text-sm">Total</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Approval;