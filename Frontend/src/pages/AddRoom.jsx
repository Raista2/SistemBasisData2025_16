import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GedungService from '../services/GedungService';
import RuanganService from '../services/RuanganService';
import bgUI from '../assets/images/bg-ui.png';

const AddRoom = () => {
    const { buildingId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const backgroundRef = useRef(null);

    // State untuk loading dan error
    const [loading, setLoading] = useState(true);
    const [buildingLoading, setBuildingLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // State untuk data gedung
    const [building, setBuilding] = useState(null);
    
    // State untuk form tambah ruangan
    const [roomName, setRoomName] = useState('');
    const [roomFloor, setRoomFloor] = useState('');
    const [roomCapacity, setRoomCapacity] = useState('');
    const [roomSize, setRoomSize] = useState('');
    const [roomType, setRoomType] = useState('');
    const [roomFacilities, setRoomFacilities] = useState('');
    const [roomImageUrl, setRoomImageUrl] = useState('');

    // Efek untuk parallax
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
        };
        
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Efek untuk memeriksa apakah pengguna adalah admin
    useEffect(() => {
        // Redirect jika bukan admin
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }

        if (!user) {
            navigate('/login', { state: { from: `/admin/add-room/${buildingId}` } });
            return;
        }

        // Fetch building data
        const fetchBuilding = async () => {
            try {
                setBuildingLoading(true);
                const data = await GedungService.getGedungById(buildingId);
                setBuilding(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching building:', err);
                setError('Gagal memuat data gedung. Silakan coba lagi nanti.');
            } finally {
                setBuildingLoading(false);
                setLoading(false);
            }
        };

        fetchBuilding();
    }, [user, navigate, buildingId]);

    // Handler untuk mengirimkan form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitLoading(true);
            setError(null);
            
            // Validasi input
            if (!roomName || !roomFloor || !roomCapacity) {
                setError('Nama ruangan, lantai, dan kapasitas harus diisi');
                setSubmitLoading(false);
                return;
            }

            const roomData = {
                gedung_id: parseInt(buildingId),
                nama: roomName,
                lantai: parseInt(roomFloor),
                kapasitas: parseInt(roomCapacity),
                luas: roomSize ? parseFloat(roomSize) : null,
                tipe: roomType || null,
                fasilitas: roomFacilities || null,
                url_gambar: roomImageUrl || null
            };

            // Panggil API untuk menambahkan ruangan
            await RuanganService.createRuangan(roomData);
            
            // Tampilkan pesan sukses
            setSuccess(true);
            
            // Reset form
            setRoomName('');
            setRoomFloor('');
            setRoomCapacity('');
            setRoomSize('');
            setRoomType('');
            setRoomFacilities('');
            setRoomImageUrl('');
            
            // Redirect ke halaman ruangan setelah 2 detik
            setTimeout(() => {
                navigate(`/ruangan/${buildingId}`);
            }, 2000);
            
        } catch (err) {
            console.error('Error adding room:', err);
            setError('Gagal menambahkan ruangan. Silakan coba lagi.');
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

                .input-dark {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                .input-dark::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .input-dark:focus {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                    outline: none;
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
                    <div className="glass-panel rounded-2xl p-8 relative z-10 fade-in-up">
                        {/* Breadcrumb Navigation */}
                        <div className="flex items-center mb-6">
                            <Link 
                                to="/gedung" 
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Gedung
                            </Link>
                            <span className="mx-2 text-white/60">/</span>
                            <Link 
                                to={`/ruangan/${buildingId}`} 
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                {building?.name || 'Loading...'}
                            </Link>
                            <span className="mx-2 text-white/60">/</span>
                            <span className="text-white">Tambah Ruangan</span>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-[950] text-white mb-2">
                                Tambah Ruangan Baru
                            </h1>
                            <p className="text-white/80">
                                Untuk gedung: <span className="text-primary-yellow">{building?.name || ''}</span>
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-500/30 border border-green-400 text-white px-4 py-3 rounded mb-6">
                                <p>Ruangan berhasil ditambahkan! Anda akan dialihkan ke halaman daftar ruangan...</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/30 border border-red-400 text-white px-4 py-3 rounded mb-6">
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nama Ruangan */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomName">
                                        Nama Ruangan <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="roomName"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                        placeholder="Masukkan nama ruangan"
                                        required
                                    />
                                </div>

                                {/* Lantai */}
                                <div>
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomFloor">
                                        Lantai <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="roomFloor"
                                        value={roomFloor}
                                        onChange={(e) => setRoomFloor(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                        placeholder="Contoh: 1, 2, 3"
                                        required
                                        min="0"
                                    />
                                </div>

                                {/* Kapasitas */}
                                <div>
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomCapacity">
                                        Kapasitas <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="roomCapacity"
                                        value={roomCapacity}
                                        onChange={(e) => setRoomCapacity(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                        placeholder="Masukkan kapasitas ruangan"
                                        required
                                        min="1"
                                    />
                                </div>

                                {/* Luas */}
                                <div>
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomSize">
                                        Luas (m²)
                                    </label>
                                    <input
                                        type="number"
                                        id="roomSize"
                                        value={roomSize}
                                        onChange={(e) => setRoomSize(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                        placeholder="Luas ruangan dalam m²"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Tipe */}
                                <div>
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomType">
                                        Tipe Ruangan
                                    </label>
                                    <select
                                        id="roomType"
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                    >
                                        <option value="" className="bg-gray-800">Pilih tipe ruangan</option>
                                        <option value="Kelas" className="bg-gray-800">Kelas</option>
                                        <option value="Lab" className="bg-gray-800">Lab</option>
                                        <option value="Aula" className="bg-gray-800">Aula</option>
                                        <option value="Ruang Rapat" className="bg-gray-800">Ruang Rapat</option>
                                        <option value="Studio" className="bg-gray-800">Studio</option>
                                        <option value="Lainnya" className="bg-gray-800">Lainnya</option>
                                    </select>
                                </div>

                                {/* URL Gambar */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomImageUrl">
                                        URL Gambar
                                    </label>
                                    <input
                                        type="url"
                                        id="roomImageUrl"
                                        value={roomImageUrl}
                                        onChange={(e) => setRoomImageUrl(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                        placeholder="https://example.com/gambar.jpg"
                                    />
                                </div>

                                {/* Fasilitas */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-white/90 text-sm font-medium mb-2" htmlFor="roomFacilities">
                                        Fasilitas
                                    </label>
                                    <textarea
                                        id="roomFacilities"
                                        value={roomFacilities}
                                        onChange={(e) => setRoomFacilities(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg input-dark focus:ring-2 focus:ring-white/50"
                                        placeholder="Deskripsi fasilitas yang tersedia di ruangan ini (AC, Proyektor, dll)"
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 mt-8">
                                <Link
                                    to={`/ruangan/${buildingId}`}
                                    className="px-6 py-3 glass-button text-white rounded-lg"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-primary-yellow text-primary-blue font-medium rounded-lg hover:bg-yellow-400 transition-all duration-300 hover:scale-105 transform"
                                    disabled={submitLoading || success}
                                >
                                    {submitLoading ? 'Menyimpan...' : 'Simpan Ruangan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddRoom;