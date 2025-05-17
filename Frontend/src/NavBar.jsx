import { useState } from 'react'
import { Link } from 'react-router-dom'

function NavBar({ user, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 w-full bg-gray-800 text-white p-3 shadow-md z-50 opacity-95 border-b-2 border-blue-100">
            <div className="w-full px-4 flex justify-between items-center">
                {/* Logo and main navigation */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-2xl font-bold text-white">Room Reservation</Link>
                    
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/map" className="text-white hover:text-gray-300 transition-colors">Map</Link>
                        <Link to="/gedung" className="text-white hover:text-gray-300 transition-colors">Gedung</Link>
                        {user && (
                            <Link to="/my-reservations" className="text-white hover:text-gray-300 transition-colors">
                                Reservasiku
                            </Link>
                        )}
                        {user && user.role === 'admin' && (
                            <Link to="/approval" className="text-white hover:text-gray-300 transition-colors">
                                Approval
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button 
                        onClick={toggleMobileMenu}
                        className="text-white p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>

                {/* Auth related links */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
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
                                        <Link 
                                            to="/profile" 
                                            className="block w-full text-left py-2 px-3 hover:bg-gray-600 rounded transition-colors"
                                        >
                                            Profile
                                        </Link>
                                        <button 
                                            onClick={onLogout}
                                            className="block w-full text-left py-2 px-3 hover:bg-gray-600 rounded transition-colors mt-1"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded transition-colors">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-700 mt-3 p-3 rounded-md">
                    <div className="flex flex-col space-y-2">
                        <Link 
                            to="/map" 
                            className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Map
                        </Link>
                        <Link 
                            to="/gedung" 
                            className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Gedung
                        </Link>
                        
                        {user && (
                            <Link 
                                to="/my-reservations" 
                                className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Reservasiku
                            </Link>
                        )}
                        
                        {user && user.role === 'admin' && (
                            <Link 
                                to="/approval" 
                                className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Approval
                            </Link>
                        )}
                        
                        {user ? (
                            <>
                                <Link 
                                    to="/profile" 
                                    className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <button 
                                    onClick={() => {
                                        onLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-left text-white py-2 px-3 hover:bg-gray-600 rounded w-full"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default NavBar;