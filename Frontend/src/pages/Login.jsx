import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="w-full max-w-sm bg-gray-100 rounded-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Login</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full px-3 py-2 bg-gray-700 text-white border-none rounded focus:outline-none focus:ring-1 focus:ring-primary-blue"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full px-3 py-2 bg-gray-700 text-white border-none rounded focus:outline-none focus:ring-1 focus:ring-primary-blue"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        className={`w-full bg-primary-blue text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-gray-700 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-blue hover:underline font-medium">
                            Register here
                        </Link>
                    </p>
                </div> 
            </div>
        </div>
    );
};

export default Login;