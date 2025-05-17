import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Reservation = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Form states
    const [purpose, setPurpose] = useState('');
    const [attendees, setAttendees] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [notes, setNotes] = useState('');

    // Get room details
    useEffect(() => {
        const fetchRoomDetails = async () => {
        try {
            const response = await axios.get(`/ruangan/${roomId}`);
            if (!response.data.success) {
            throw new Error(response.data.message);
            }
            
            setRoom(response.data.payload);
        } catch (error) {
            setError(error.message || 'Failed to fetch room details');
            console.error('Error fetching room details:', error);
        } finally {
            setLoading(false);
        }
        };

        fetchRoomDetails();
    }, [roomId]);

    // Redirects if not authenticated
    useEffect(() => {
        if (!user) {
        navigate('/login', { state: { from: `/reservation/${roomId}` } });
        }
    }, [user, navigate, roomId]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError(null);

        try {
        // Format date for backend
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const response = await axios.post('/peminjaman', {
            ruangan_id: parseInt(roomId),
            tanggal: formattedDate,
            waktu_mulai: startTime,
            waktu_selesai: endTime,
            keperluan: purpose,
            jumlah_peserta: parseInt(attendees),
            catatan: notes
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
            setSubmitSuccess(true);
            // Reset form
            setPurpose('');
            setAttendees('');
            setDate(new Date());
            setStartTime('08:00');
            setEndTime('10:00');
            setNotes('');
            
            // Redirect after delay
            setTimeout(() => {
            navigate('/my-reservations');
            }, 2000);
        } else {
            setSubmitError(response.data.message);
        }
        } catch (error) {
        setSubmitError(error.response?.data?.message || 'Failed to create reservation');
        console.error('Error creating reservation:', error);
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
                <h1 className="text-3xl font-bold mb-6">Reservasi Ruangan</h1>

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

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-wrap">
                        <div className="w-full md:w-1/3 pr-4">
                            {room?.imageUrl ? (
                                <img
                                    src={room.imageUrl}
                                    alt={`Ruangan ${room.name}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        <div className="w-full md:w-2/3 mt-4 md:mt-0">
                            <h2 className="text-2xl font-bold">{room?.name}</h2>
                            <p className="text-gray-600 mb-4">{room?.buildingName}, Lantai {room?.floor}</p>

                            <div className="grid grid-cols-2 gap-y-2">
                                <div>
                                    <span className="text-gray-700 font-semibold">Kapasitas:</span>
                                    <span className="ml-2">{room?.capacity} orang</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Luas:</span>
                                    <span className="ml-2">{room?.size} m²</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Tipe:</span>
                                    <span className="ml-2">{room?.type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-semibold">Fasilitas:</span>
                                    <span className="ml-2">{room?.facilities || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Form Reservasi</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="purpose">
                                Keperluan
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="text"
                                id="purpose"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                required
                                placeholder="Contoh: Rapat Organisasi, Bimbingan Skripsi, dll"
                            />
                        </div>

                        {/* Rest of the form fields remain the same */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="attendees">
                                Jumlah Peserta
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="number"
                                id="attendees"
                                value={attendees}
                                onChange={(e) => setAttendees(e.target.value)}
                                required
                                min="1"
                                max={room?.capacity}
                                placeholder={`Max: ${room?.capacity} orang`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">
                                Tanggal Reservasi
                            </label>
                            <DatePicker
                                selected={date}
                                onChange={(date) => setDate(date)}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-wrap -mx-2 mb-4">
                            <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="startTime">
                                    Waktu Mulai
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="time"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="endTime">
                                    Waktu Selesai
                                </label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="time"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="notes">
                                Catatan Tambahan (Opsional)
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