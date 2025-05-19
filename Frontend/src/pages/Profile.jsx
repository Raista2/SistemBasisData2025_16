import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUserData } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [passwordChangeMode, setPasswordChangeMode] = useState(false);

    // Load user data
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/profile' } });
            return;
        }

        setUsername(user.username || '');
        setEmail(user.email || '');
    }, [user, navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await updateUserData({
                username,
                email
            });

            setSuccess('Profil berhasil diperbarui');
            setEditMode(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate passwords
        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok');
            return;
        }

        setLoading(true);

        try {
            await updateUserData({
                currentPassword,
                newPassword
            });

            setSuccess('Password berhasil diubah');
            setPasswordChangeMode(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setUsername(user.username || '');
        setEmail(user.email || '');
        setEditMode(false);
        setError(null);
    };

    const cancelPasswordChange = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordChangeMode(false);
        setError(null);
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16 bg-white">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
                    <p className="text-primary-blue font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 bg-white">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-primary-blue">Profil Pengguna</h1>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Informasi Akun</h2>
                            {!editMode && (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="text-primary-blue hover:bg-primary-blue hover:text-white py-1 px-2 rounded transition-colors"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editMode ? (
                            <form onSubmit={handleProfileUpdate} className="mt-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold mb-2" htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-bem-darkblue transition-colors ${
                                            loading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-4 text-gray-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Username</p>
                                        <p className="font-medium">{user.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Role</p>
                                        <p className="font-medium capitalize">{user.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bergabung pada</p>
                                        <p className="font-medium">
                                            {(user.createdAt || user.created_at)
                                                ? new Date(user.createdAt || user.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Terakhir diperbarui</p>
                                        <p className="font-medium">
                                            {(user.updatedAt || user.updated_at)
                                                ? new Date(user.updatedAt || user.updated_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Keamanan</h2>
                            {!passwordChangeMode && (
                                <button
                                    onClick={() => setPasswordChangeMode(true)}
                                    className="text-primary-blue hover:bg-primary-blue hover:text-white py-1 px-2 rounded transition-colors"
                                >
                                    Ubah Password
                                </button>
                            )}
                        </div>

                        {passwordChangeMode ? (
                            <form onSubmit={handlePasswordChange} className="mt-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold mb-2" htmlFor="currentPassword">
                                        Password Saat Ini
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold mb-2" htmlFor="newPassword">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold mb-2" htmlFor="confirmPassword">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={cancelPasswordChange}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-bem-darkblue transition-colors ${
                                            loading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {loading ? 'Menyimpan...' : 'Ubah Password'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-4 text-gray-800">
                                <p className="text-gray-600">
                                    Terakhir diubah: {user.passwordUpdatedAt
                                        ? new Date(user.passwordUpdatedAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })
                                        : 'Tidak tersedia'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Aktivitas Akun</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bem-lightblue bg-opacity-10 p-4 rounded-lg">
                            <h3 className="font-bold text-lg text-primary-blue mb-2">Total Reservasi</h3>
                            <p className="text-3xl font-bold text-gray-800">{user.totalReservations || 0}</p>
                            <button
                                onClick={() => navigate('/my-reservations')}
                                className="mt-2 text-primary-blue hover:bg-primary-blue hover:text-white py-1 px-2 rounded transition-colors text-sm"
                            >
                                Lihat semua reservasi
                            </button>
                        </div>
                        <div className="bg-primary-yellow bg-opacity-10 p-4 rounded-lg">
                            <h3 className="font-bold text-lg text-primary-blue mb-2">Reservasi Disetujui</h3>
                            <p className="text-3xl font-bold text-gray-800">{user.approvedReservations || 0}</p>
                            <button
                                onClick={() => navigate('/my-reservations?status=approved')}
                                className="mt-2 text-primary-blue hover:bg-primary-blue hover:text-white py-1 px-2 rounded transition-colors text-sm"
                            >
                                Lihat reservasi disetujui
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;