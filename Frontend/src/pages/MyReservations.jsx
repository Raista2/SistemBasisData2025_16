// src/pages/MyReservations.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyReservations = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`/peminjaman/user/${user.id}`);
        
        if (response.data.success) {
          setReservations(response.data.payload);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError('Failed to fetch your reservations');
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReservations();
  }, [user]);

  const handleCancelReservation = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const response = await axios.delete(`/peminjaman/${id}`);
      
      if (response.data.success) {
        // Remove from local state
        setReservations(reservations.filter(res => res.id !== id));
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Failed to cancel reservation');
      console.error('Error cancelling reservation:', error);
    }
  };

  // Format date and time for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Reservations</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {reservations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{reservation.ruangan_nama}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.status === 'approved' ? 'Approved' :
                     reservation.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
                <p className="text-gray-600">{reservation.gedung_nama}</p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-700"><strong>Date:</strong> {formatDate(reservation.tanggal)}</p>
                    <p className="text-gray-700"><strong>Time:</strong> {reservation.waktu_mulai} - {reservation.waktu_selesai}</p>
                  </div>
                  <div>
                    <p className="text-gray-700"><strong>Purpose:</strong> {reservation.keperluan}</p>
                    <p className="text-gray-700"><strong>Participants:</strong> {reservation.jumlah_peserta}</p>
                  </div>
                </div>
                
                {reservation.catatan && (
                  <div className="mt-2">
                    <p className="text-gray-700"><strong>Notes:</strong> {reservation.catatan}</p>
                  </div>
                )}
                
                {reservation.status === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">You don't have any reservations yet.</p>
          <Link to="/gedung" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Book a Room
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyReservations;