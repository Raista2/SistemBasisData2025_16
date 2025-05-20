import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RuanganService from '../services/RuanganService';
import PeminjamanService from '../services/PeminjamanService';

const Reservation = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
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
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="pt-16 container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || "Room not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-black">Reservasi Ruangan</h1>

                {submitSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        Reservasi berhasil dibuat! Anda akan dialihkan ke halaman daftar reservasi...
                    </div>
                )}

                {submitError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {submitError}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-black">
                    <h2 className="text-xl font-bold mb-4">Detail Ruangan</h2>
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 mb-4 md:mb-0">
                            <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                                {room.imageUrl ? (
                                    <img
                                        src={room.imageUrl}
                                        alt={room.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:w-2/3 md:pl-6">
                            <h3 className="text-lg font-bold mb-2">{room.name}</h3>
                            <p className="text-gray-600 mb-4">{room.buildingName}</p>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div>
                                    <span className="text-gray-700 font-semibold">Kapasitas:</span>
                                    <span className="ml-2">{room.capacity} orang</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Lantai:</span>
                                    <span className="ml-2">{room.floor}</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Luas:</span>
                                    <span className="ml-2">{room.size} m²</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Tipe:</span>
                                    <span className="ml-2">{room.type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Fasilitas:</span>
                                    <span className="ml-2">{room.facilities || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-black">Form Reservasi</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="purpose">
                                Keperluan
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="purpose"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="Masukkan keperluan reservasi"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="date">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={today}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="startTime">
                                    Waktu Mulai
                                </label>
                                <input
                                    type="time"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="endTime">
                                    Waktu Selesai
                                </label>
                                <input
                                    type="time"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="attendees">
                                Jumlah Peserta
                            </label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="attendees"
                                value={attendees}
                                onChange={(e) => setAttendees(e.target.value)}
                                min="1"
                                max={room.capacity}
                                required
                            />
                            <p className="text-sm text-gray-600 mt-1">Maksimum {room.capacity} orang</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="notes">
                                Catatan (Optional)
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="notes"
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tambahkan catatan khusus, kebutuhan peralatan, dll"
                            ></textarea>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                className="mr-4 text-gray-700 hover:text-gray-900"
                                onClick={() => navigate(`/ruangan/${room?.buildingId || 1}`)}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className={`bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
                                    submitLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitLoading ? 'Memproses...' : 'Submit Reservasi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reservation;