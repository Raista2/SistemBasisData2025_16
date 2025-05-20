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
    const [recentReservations, setRecentReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for parallax effect
    const [scrollY, setScrollY] = useState(0);
    
    // Ref for the continuous background
    const backgroundRef = useRef(null);
    
    // Add listener for scroll event to create parallax effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
        };
        
        window.addEventListener('scroll', handleScroll);
        
        // Call once on mount to set initial position
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Pastikan semua Promise selesai dengan Promise.all
                const [buildingsData, roomsData, reservationsData] = await Promise.all([
                    GedungService.getAllGedung(),
                    RuanganService.getAllRuangan(),
                    user ? PeminjamanService.getPeminjamanByUser(user.id) : [],
                ]);
                
                // Hitung reservasi yang pending
                const pendingReservations = user 
                    ? reservationsData.filter(r => r.status === 'pending').length 
                    : 0;
                
                // Set stats data
                setStats({
                    totalBuildings: buildingsData.length,
                    totalRooms: roomsData.length,
                    totalReservations: reservationsData.length,
                    pendingReservations: pendingReservations
                });
                
                // Set recent reservations (sort by date, take last 5)
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
                
                // Set default stats jika gagal fetch
                setStats({
                    totalBuildings: 0,
                    totalRooms: 0,
                    totalReservations: 0,
                    pendingReservations: 0
                });
            } finally {
                // Penting: selalu akhiri loading state
                setLoading(false);
            }
        };
        
        fetchData();
        
        // Tambahkan timeout untuk menghindari loading tak terbatas
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
        }, 10000); // 10 detik timeout
        
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

    if (loading) {
        return (
            <div className="pt-16 flex justify-center items-center h-screen font-qanelas bg-white">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                    <p className="text-primary-blue font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Parallax background style with bg-ftui.png
    const backgroundStyle = {
        backgroundImage: `url(${bgUI})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        opacity: 0.2,
        // Add this to control parallax direction and speed
        transform: `translateY(${-window.scrollY * 0.15}px)` // Negative value reverses direction, 0.15 slows it down
    };
    
    // Blur overlay for background
    const overlayStyle = {
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(17, 24, 39, 0.85)', // Semi-transparent dark background 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    };

    return (
        <div className="pt-16 min-h-screen font-qanelas">
            {/* Continuous parallax background for all sections */}
            <div 
                ref={backgroundRef}
                className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
                style={{ 
                    backgroundImage: `url(${bgUI})`,
                    transform: `translateY(${scrollY * 0.3}px)`,
                    opacity: 0.15
                }}
            ></div>
            
            {/* Hero Section with BEM FTUI style */}
            <div className="bg-primary-blue text-white py-16 relative overflow-hidden">
                {/* Blurred background effect for hero only */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20" 
                    style={{ backgroundImage: `url(${bgUI})` }}></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-qanelas font-[950] mb-4">Pinjam Ruang FT V2</h1>
                        <p className="text-xl mb-8 font-medium">Sistem peminjaman ruangan Fakultas Teknik yang lebih efisien, cepat, dan mudah digunakan</p>
                        {!user ? (
                            <div className="space-x-4">
                                <Link to="/login" className="bg-white text-primary-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-primary-yellow text-primary-blue px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/reservation" className="bg-white text-primary-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    Buat Reservasi
                                </Link>
                                <Link to="/my-reservations" className="bg-primary-yellow text-primary-blue px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                                    Lihat Reservasi Saya
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics section */}
            <div className="relative py-12">
                <div style={backgroundStyle}></div>
                <div style={overlayStyle}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg py-6 px-4 text-center shadow-lg">
                            <span className="text-3xl font-qanelas font-[950] text-primary-blue">{stats.totalBuildings}</span>
                            <p className="text-gray-600 mt-2">Total Gedung</p>
                        </div>
                        <div className="bg-white rounded-lg py-6 px-4 text-center shadow-lg">
                            <span className="text-3xl font-qanelas font-[950] text-primary-blue">{stats.totalRooms}</span>
                            <p className="text-gray-600 mt-2">Total Ruangan</p>
                        </div>
                        <div className="bg-white rounded-lg py-6 px-4 text-center shadow-lg">
                            <span className="text-3xl font-qanelas font-[950] text-primary-blue">{stats.totalReservations}</span>
                            <p className="text-gray-600 mt-2">Total Reservasi</p>
                        </div>
                        <div className="bg-white rounded-lg py-6 px-4 text-center shadow-lg">
                            <span className="text-3xl font-qanelas font-[950] text-primary-blue">{stats.pendingReservations}</span>
                            <p className="text-gray-600 mt-2">Menunggu Persetujuan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features block */}
            <div className="relative py-12">
                <div style={backgroundStyle}></div>
                <div style={overlayStyle}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl font-qanelas font-[950] text-center mb-10 text-white">Fitur Utama</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">Reservasi Ruangan</h3>
                            <p className="text-gray-600 mb-4">Pesan ruangan untuk kegiatan akademik, rapat, atau acara lainnya dengan mudah dan cepat.</p>
                            <Link to="/reservation" className="text-primary-blue hover:text-primary-darkblue font-medium">
                                Buat Reservasi →
                            </Link>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">Peta Gedung</h3>
                            <p className="text-gray-600 mb-4">Lihat lokasi gedung di peta interaktif untuk memudahkan pencarian ruangan yang diinginkan.</p>
                            <Link to="/map" className="text-primary-blue hover:text-primary-darkblue font-medium">
                                Lihat Peta →
                            </Link>
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="bg-primary-blue text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-qanelas font-[800] mb-2 text-gray-800">Status Reservasi</h3>
                            <p className="text-gray-600 mb-4">Pantau status reservasi Anda, lihat riwayat, dan dapatkan notifikasi ketika disetujui.</p>
                            <Link to="/my-reservations" className="text-primary-blue hover:text-primary-darkblue font-medium">
                                Lihat Status →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reservations */}
            {user && recentReservations.length > 0 && (
                <div className="bg-gray-900 bg-opacity-85 py-12 relative z-10">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-qanelas font-[800] mb-6 text-white">Reservasi Terbaru</h2>
                        
                        <div className="overflow-hidden rounded-lg shadow-lg">
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
                                        {recentReservations.map(reservation => (
                                            <tr key={reservation.id} className="border-t hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">{reservation.roomName}</div>
                                                    <div className="text-sm text-gray-500">{reservation.buildingName}</div>
                                                </td>
                                                <td className="py-3 px-4">{formatDate(reservation.date)}</td>
                                                <td className="py-3 px-4">{reservation.startTime} - {reservation.endTime}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                                                        className="text-primary-blue hover:text-primary-darkblue"
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

            <div className="relative py-12">
                <div style={backgroundStyle}></div>
                <div style={overlayStyle}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl font-[950] text-center mb-10 text-white">Cara Kerja</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-primary-blue bg-opacity-90 text-white p-6 rounded-lg relative text-center">
                            <div className="absolute -top-4 -right-4 bg-primary-yellow text-primary-blue w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                                1
                            </div>
                            <h3 className="text-xl font-bold mb-4">Pilih Gedung & Ruangan</h3>
                            <p>Pilih gedung dan ruangan yang sesuai dengan kebutuhan Anda dari daftar yang tersedia.</p>
                        </div>
                        
                        <div className="bg-primary-blue bg-opacity-90 text-white p-6 rounded-lg relative text-center">
                            <div className="absolute -top-4 -right-4 bg-primary-yellow text-primary-blue w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                                2
                            </div>
                            <h3 className="text-xl font-bold mb-4">Isi Form Reservasi</h3>
                            <p>Isi form reservasi dengan tanggal, waktu, jumlah peserta, dan keperluan peminjaman.</p>
                        </div>
                        
                        <div className="bg-primary-blue bg-opacity-90 text-white p-6 rounded-lg relative text-center">
                            <div className="absolute -top-4 -right-4 bg-primary-yellow text-primary-blue w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                                3
                            </div>
                            <h3 className="text-xl font-bold mb-4">Tunggu Persetujuan</h3>
                            <p>Admin akan memeriksa dan menyetujui reservasi Anda dalam waktu singkat.</p>
                        </div>
                        
                        <div className="bg-primary-blue bg-opacity-90 text-white p-6 rounded-lg relative text-center">
                            <div className="absolute -top-4 -right-4 bg-primary-yellow text-primary-blue w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">
                                4
                            </div>
                            <h3 className="text-xl font-bold mb-4">Gunakan Ruangan</h3>
                            <p>Setelah disetujui, Anda dapat menggunakan ruangan sesuai dengan jadwal yang telah dipesan.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action - Full width blue block */}
            <div className="bg-primary-blue text-white py-12 relative overflow-hidden">
                {/* Blurred background effect */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20" 
                    style={{ backgroundImage: `url(${bgUI})` }}></div>
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl font-qanelas font-[950] mb-4">Siap untuk membuat reservasi?</h2>
                    <p className="text-xl mb-6">Mulai pesan ruangan sekarang dan manfaatkan fasilitas kampus dengan optimal</p>
                    <Link 
                        to={user ? "/reservation" : "/login"} 
                        className="bg-primary-yellow text-primary-blue px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors inline-block"
                    >
                        {user ? "Buat Reservasi Sekarang" : "Login untuk Mulai"}
                    </Link>
                </div>
            </div>

            {/* Footer - Yellow background */}
            <footer className="bg-primary-yellow text-primary-blue py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-qanelas font-[800]">Pinjam Ruang FT V2</h3>
                            <p className="text-primary-blue">Sistem Reservasi Ruangan Fakultas Teknik</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                            <Link to="/map" className="hover:text-primary-darkblue">Peta Gedung</Link>
                            <Link to="/gedung" className="hover:text-primary-darkblue">Daftar Gedung</Link>
                            <Link to="/reservation" className="hover:text-primary-darkblue">Reservasi</Link>
                            {user && <Link to="/my-reservations" className="hover:text-primary-darkblue">Reservasiku</Link>}
                        </div>
                    </div>
                    <div className="border-t border-primary-blue mt-6 pt-6 text-center">
                        <p>&copy; {new Date().getFullYear()} Room Reservation. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;