import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RuanganService from '../services/RuanganService';
import PeminjamanService from '../services/PeminjamanService';
import bgUI from '../assets/images/bg-ui.png';

const Reservation = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const backgroundRef = useRef(null);
    
    // Form state
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [attendees, setAttendees] = useState('');
    const [notes, setNotes] = useState('');
    
    // Form submission state
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [conflicts, setConflicts] = useState([]);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

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
            navigate('/login', { state: { from: `/reservation/${roomId}` } });
            return;
        }
        
        const fetchRoom = async () => {
            try {
                setLoading(true);
                const roomData = await RuanganService.getRuanganById(roomId);
                setRoom(roomData);
                setError(null);
            } catch (err) {
                console.error('Error fetching room details:', err);
                setError('Gagal memuat detail ruangan. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchRoom();
    }, [roomId, navigate, user]);
    
    const checkConflicts = async () => {
        if (!date || !startTime || !endTime) return false;
        
        try {
            const conflictingReservations = await PeminjamanService.checkConflicts(
                roomId, date, startTime, endTime
            );
            
            setConflicts(conflictingReservations);
            return conflictingReservations.length > 0;
        } catch (err) {
            console.error('Error checking conflicts:', err);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitLoading(true);
            setSubmitError(null);
            
            // Validate form
            if (!date || !startTime || !endTime || !purpose || !attendees) {
                setSubmitError('Semua field harus diisi.');
                return;
            }
            
            // Check for conflicts
            const hasConflicts = await checkConflicts();
            if (hasConflicts) {
                setSubmitError('Ruangan sudah direservasi pada waktu tersebut. Silakan pilih waktu lain.');
                return;
            }
            
            // Create reservation
            const reservationData = {
                ruangan_id: roomId,
                tanggal: date,
                waktu_mulai: startTime,
                waktu_selesai: endTime,
                keperluan: purpose,
                jumlah_peserta: parseInt(attendees),
                catatan: notes || null
            };
            
            await PeminjamanService.createPeminjaman(reservationData);
            
            // Show success message
            setSubmitSuccess(true);
            
            // Reset form
            setDate('');
            setStartTime('');
            setEndTime('');
            setPurpose('');
            setAttendees('');
            setNotes('');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/approval');
            }, 2000);
            
        } catch (err) {
            console.error('Error creating reservation:', err);
            setSubmitError('Gagal membuat reservasi. Silakan coba lagi.');
        } finally {
            setSubmitLoading(false);
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

    if (error || !room) {
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
                        <p className="text-white/80 mb-6">{error || "Ruangan tidak ditemukan"}</p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="block w-full px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            >
                                Coba Lagi
                            </button>
                            <Link 
                                to="/reservation"
                                className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 border border-white/20"
                            >
                                ← Kembali ke Daftar Ruangan
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

                .success-alert {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: rgb(34, 197, 94);
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
                    <div className="max-w-4xl mx-auto">
                        {/* Back Navigation */}
                        <div className="py-6 w-full mb-6">
                            <Link 
                                to="/reservation"
                                className="inline-flex items-center glass-button text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Daftar Ruangan
                            </Link>
                        </div>

                        {/* Page Title */}
                        <div className="py-8 w-full mb-8">
                            <h1 className="text-4xl md:text-5xl font-[950] text-white mb-4 drop-shadow-lg text-center">
                                Reservasi Ruangan
                            </h1>
                            <p className="text-white/80 text-lg text-center">
                                Lengkapi form di bawah untuk melakukan reservasi ruangan
                            </p>
                        </div>

                        {/* Success/Error Alerts */}
                        {submitSuccess && (
                            <div className="mb-6">
                                <div className="glass-panel rounded-xl p-4 success-alert fade-in-up">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Reservasi berhasil dibuat! Anda akan dialihkan ke halaman daftar reservasi...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <div className="mb-6">
                                <div className="glass-panel rounded-xl p-4 error-alert fade-in-up">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">{submitError}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Room Details Section */}
                        <div className="py-8 w-full mb-8">
                            <div className="glass-panel rounded-2xl p-8 fade-in-up">
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-primary-blue/30 rounded-xl mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-[800] text-white">Detail Ruangan</h2>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Room Image */}
                                    <div className="md:w-1/3">
                                        <div className="h-48 rounded-xl overflow-hidden">
                                            {room.imageUrl ? (
                                                <img
                                                    src={room.imageUrl}
                                                    alt={room.name}
                                                    className="w-full h-full object-cover"
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
                                        </div>
                                    </div>

                                    {/* Room Info */}
                                    <div className="md:w-2/3">
                                        <h3 className="text-2xl font-bold text-white mb-2">{room.name}</h3>
                                        <p className="text-white/80 mb-6 text-lg">{room.buildingName}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="glass-button p-4 rounded-xl">
                                                <div className="flex items-center text-white/90">
                                                    <svg className="w-5 h-5 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs text-white/60">Kapasitas</p>
                                                        <p className="font-semibold">{room.capacity} orang</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="glass-button p-4 rounded-xl">
                                                <div className="flex items-center text-white/90">
                                                    <svg className="w-5 h-5 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs text-white/60">Lantai</p>
                                                        <p className="font-semibold">{room.floor}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="glass-button p-4 rounded-xl">
                                                <div className="flex items-center text-white/90">
                                                    <svg className="w-5 h-5 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4a1 1 0 011-1h4m12 0h4a1 1 0 011 1v4m0 12v4a1 1 0 01-1 1h-4M4 16v4a1 1 0 001 1h4" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs text-white/60">Luas</p>
                                                        <p className="font-semibold">{room.size} m²</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="glass-button p-4 rounded-xl">
                                                <div className="flex items-center text-white/90">
                                                    <svg className="w-5 h-5 mr-3 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs text-white/60">Tipe</p>
                                                        <p className="font-semibold">{room.type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {room.facilities && (
                                            <div className="mt-4">
                                                <div className="glass-button p-4 rounded-xl">
                                                    <div className="flex items-start text-white/90">
                                                        <svg className="w-5 h-5 mr-3 mt-0.5 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div>
                                                            <p className="text-xs text-white/60 mb-1">Fasilitas</p>
                                                            <p className="font-semibold">{room.facilities}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reservation Form */}
                        <div className="py-8 w-full">
                            <div className="glass-panel rounded-2xl p-8 fade-in-up">
                                <div className="flex items-center mb-8">
                                    <div className="p-3 bg-primary-yellow/30 rounded-xl mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-[800] text-white">Form Reservasi</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Purpose */}
                                    <div className="stagger-animation" style={{ animationDelay: '0.1s' }}>
                                        <label className="block text-white font-medium mb-3" htmlFor="purpose">
                                            Keperluan
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300"
                                            id="purpose"
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            placeholder="Masukkan keperluan reservasi"
                                            required
                                        />
                                    </div>

                                    {/* Date */}
                                    <div className="stagger-animation" style={{ animationDelay: '0.2s' }}>
                                        <label className="block text-white font-medium mb-3" htmlFor="date">
                                            Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300"
                                            id="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            min={today}
                                            required
                                        />
                                    </div>

                                    {/* Time Range */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-animation" style={{ animationDelay: '0.3s' }}>
                                        <div>
                                            <label className="block text-white font-medium mb-3" htmlFor="startTime">
                                                Waktu Mulai
                                            </label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300"
                                                id="startTime"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-medium mb-3" htmlFor="endTime">
                                                Waktu Selesai
                                            </label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300"
                                                id="endTime"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Attendees */}
                                    <div className="stagger-animation" style={{ animationDelay: '0.4s' }}>
                                        <label className="block text-white font-medium mb-3" htmlFor="attendees">
                                            Jumlah Peserta
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300"
                                            id="attendees"
                                            value={attendees}
                                            onChange={(e) => setAttendees(e.target.value)}
                                            min="1"
                                            max={room.capacity}
                                            required
                                        />
                                        <p className="text-white/60 text-sm mt-2">Maksimum {room.capacity} orang</p>
                                    </div>

                                    {/* Notes */}
                                    <div className="stagger-animation" style={{ animationDelay: '0.5s' }}>
                                        <label className="block text-white font-medium mb-3" htmlFor="notes">
                                            Catatan (Optional)
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 glass-input rounded-lg focus:outline-none transition-all duration-300 resize-none"
                                            id="notes"
                                            rows="4"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Tambahkan catatan khusus, kebutuhan peralatan, dll"
                                        ></textarea>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 stagger-animation" style={{ animationDelay: '0.6s' }}>
                                        <button
                                            type="button"
                                            className="glass-button text-white px-8 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300"
                                            onClick={() => navigate(`/ruangan/${room?.buildingId || 1}`)}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitLoading}
                                            className={`bg-primary-blue/80 hover:bg-primary-blue text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                                                submitLoading ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {submitLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                                                    Memproses...
                                                </div>
                                            ) : (
                                                'Submit Reservasi'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reservation;