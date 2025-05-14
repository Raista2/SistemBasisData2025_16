import { useState } from 'react'
import { Link } from 'react-router-dom'

function NavBar({ user, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 w-full bg-gray-800 text-white p-3 shadow-md z-50 opacity-95 border-b-2 border-blue-100">
            <div className="w-full px-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-2xl font-bold text-white">Home</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/gacha" className="text-white hover:text-gray-300">Gacha</Link>
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center gap-1 font-bold text-l hover:text-gray-300 transition-colors"
                                >
                                    {user.username}
                                    <svg
                                        className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 bg-gray-700 rounded-md shadow-lg p-2 min-w-[160px] z-20">
                                        <button 
                                            onClick={onLogout}
                                            className="block w-full text-left py-2 px-3 hover:bg-gray-600 rounded transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded transition-colors">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;