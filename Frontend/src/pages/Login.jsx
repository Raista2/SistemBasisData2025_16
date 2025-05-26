import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgUI2 from '../assets/images/bg-ui-2.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            
            if (!result.success) {
                setError(result.message);
            } else {
                // Redirect to reservation page on success
                navigate('/reservation');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Full screen background */}
            <div 
                className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${bgUI2})`,
                }}
            />
            
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-30" />
            
            {/* Content container */}
            <div className="relative z-10 pt-16 flex justify-center items-center min-h-screen">
                {/* Glassmorphism card */}
                <div className="w-full max-w-md mx-4">
                    <div className="backdrop-blur-md bg-white/15 border border-white/20 rounded-2xl p-8 shadow-2xl hover:bg-white/20 transition-all duration-500">
                    <h1 className="text-3xl font-[950] mb-8 text-white text-center drop-shadow-lg">
                        Masuk
                    </h1>

                    {error && (
                        <div className="backdrop-blur-sm bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-lg mb-6 shadow-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2 drop-shadow" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-300"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            className={`w-full backdrop-blur-sm bg-primary-blue/80 hover:bg-primary-blue/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                            }`}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Harap tunggu...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center relative z-30">
                        <p className="text-white/80 text-sm drop-shadow">
                            Tidak memiliki akun?{' '}
                            <Link 
                                to="/register" 
                                className="text-primary-yellow hover:text-yellow-300 font-semibold transition-colors duration-300 drop-shadow hover:drop-shadow-lg"
                            >
                                Daftar disini
                            </Link>
                        </p>
                    </div>

                    {/* Pindahkan decorations ke sini, setelah Link */}
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl -z-10"></div>
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-blue/10 rounded-full blur-2xl -z-10"></div>
                </div>
            </div>
        </div>
    </>
    );
};

export default Login;