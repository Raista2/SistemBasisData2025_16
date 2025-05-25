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
    const [isVisible, setIsVisible] = useState({});
    
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

    // Refs for intersection observer
    const roomDetailsRef = useRef(null);
    const formRef = useRef(null);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

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
                roomDetails: true,
                form: true
            });
        }, 2000);

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        const elements = [roomDetailsRef.current, formRef.current];
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
                navigate('/my-reservations');
            }, 2000);
            
        } catch (err) {
            console.error('Error creating reservation:', err);
            setSubmitError('Gagal membuat reservasi. Silakan coba lagi.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Animation classes
    const fadeInUp = `transform transition-all duration-700 ease-out ${
        isVisible.roomDetails ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-90'
    }`;

    const fadeInLeft = `transform transition-all duration-700 ease-out ${
        isVisible.form ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-90'
    }`;

    if (loading) {
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

    if (error || !room) {
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
                
                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg animate-fade-in-up">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error || "Room not found"}
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <Link 
                                to="/reservation"
                                className="inline-flex items-center text-white bg-primary-blue hover:bg-bem-darkblue px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg transform"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Daftar Ruangan
                            </Link>
                        </div>
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
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center mb-6 animate-fade-in-left">
                            <Link 
                                to="/reservation"
                                className="inline-flex items-center text-white hover:text-primary-yellow font-medium mr-4 transition-all duration-300 hover:scale-105"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Daftar Ruangan
                            </Link>
                        </div>

                        <h1 className="text-4xl font-qanelas font-[950] mb-4 animate-fade-in-down">
                            Reservasi Ruangan
                        </h1>
                        <p className="text-xl font-medium animate-fade-in-up animation-delay-200">
                            Isi formulir di bawah untuk membuat reservasi ruangan
                        </p>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages */}
            {submitSuccess && (
                <div className="relative py-4 w-full">
                    <div className="w-full px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg animate-fade-in-up">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Reservasi berhasil dibuat! Anda akan dialihkan ke halaman daftar reservasi...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {submitError && (
                <div className="relative py-4 w-full">
                    <div className="w-full px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg animate-fade-in-up">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {submitError}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Room Details Section */}
            <div id="roomDetails" ref={roomDetailsRef} className="relative py-12 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className={`bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] transform ${fadeInUp}`}>
                            <h2 className="text-2xl font-qanelas font-[800] mb-6 text-gray-800 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Detail Ruangan
                            </h2>
                            
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/2">
                                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner group">
                                        {room.imageUrl ? (
                                            <img
                                                src={room.imageUrl}
                                                alt={room.name}
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
                                </div>
                                
                                <div className="lg:w-1/2">
                                    <h3 className="text-2xl font-qanelas font-[700] mb-3 text-gray-800">{room.name}</h3>
                                    <p className="text-gray-600 mb-6 font-normal text-lg flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {room.buildingName}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
                                        {[
                                            { icon: "👥", label: "Kapasitas", value: `${room.capacity} orang` },
                                            { icon: "🏢", label: "Lantai", value: room.floor },
                                            { icon: "📐", label: "Luas", value: `${room.size} m²` },
                                            { icon: "🏷️", label: "Tipe", value: room.type }
                                        ].map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-3">{item.icon}</span>
                                                    <div>
                                                        <span className="text-gray-700 font-medium block text-sm">{item.label}</span>
                                                        <span className="text-gray-900 font-semibold">{item.value}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="col-span-full bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                            <div className="flex items-start">
                                                <span className="text-2xl mr-3">🔧</span>
                                                <div>
                                                    <span className="text-gray-700 font-medium block text-sm">Fasilitas</span>
                                                    <span className="text-gray-900 font-semibold">{room.facilities || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservation Form Section */}
            <div id="form" ref={formRef} className="relative py-12 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent backdrop-blur-md bg-clip-padding backdrop-filter"></div>
                <div className="w-full px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className={`bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-all duration-500 ${fadeInLeft}`}>
                            <h2 className="text-2xl font-qanelas font-[800] mb-6 text-gray-800 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Form Reservasi
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="group">
                                    <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue" htmlFor="purpose">
                                        Keperluan *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                        id="purpose"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        placeholder="Masukkan keperluan reservasi"
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue" htmlFor="date">
                                        Tanggal *
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                        id="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        min={today}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue" htmlFor="startTime">
                                            Waktu Mulai *
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                            id="startTime"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue" htmlFor="endTime">
                                            Waktu Selesai *
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                            id="endTime"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue" htmlFor="attendees">
                                        Jumlah Peserta *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400"
                                        id="attendees"
                                        value={attendees}
                                        onChange={(e) => setAttendees(e.target.value)}
                                        min="1"
                                        max={room.capacity}
                                        required
                                    />
                                    <p className="text-sm text-gray-600 mt-2 font-normal flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Maksimum {room.capacity} orang
                                    </p>
                                </div>

                                <div className="group">
                                    <label className="block text-gray-700 font-medium mb-2 transition-colors group-focus-within:text-primary-blue" htmlFor="notes">
                                        Catatan (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-normal transition-all duration-300 hover:border-gray-400 resize-none"
                                        id="notes"
                                        rows="4"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Tambahkan catatan khusus, kebutuhan peralatan, dll"
                                    ></textarea>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto px-6 py-3 text-primary-blue hover:text-bem-darkblue font-medium transition-all duration-300 hover:bg-gray-50 rounded-lg border border-gray-300 hover:border-primary-blue"
                                        onClick={() => navigate(`/ruangan/${room?.buildingId || 1}`)}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className={`w-full sm:w-auto bg-primary-blue text-white py-3 px-8 rounded-lg hover:bg-bem-darkblue transition-all duration-300 font-medium transform hover:scale-105 hover:shadow-lg flex items-center justify-center ${
                                            submitLoading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {submitLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Submit Reservasi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
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
                input:focus, textarea:focus {
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
                button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }

                /* Form field animations */
                input, textarea {
                    transition: all 0.3s ease;
                }

                input:hover, textarea:hover {
                    border-color: #9CA3AF;
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
            `}</style>
        </div>
    );
};

export default Reservation;