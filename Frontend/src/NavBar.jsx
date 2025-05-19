import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function NavBar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 w-full bg-primary-blue text-white p-3 shadow-md z-50 opacity-95 border-b-2 border-primary-yellow">
            <div className="w-full px-4 flex justify-between items-center">
                {/* Logo and main navigation */}
                <div className="flex items-center gap-4">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                    <Link to="/" className="text-2xl font-bold text-white">PinjamRuang FT UI</Link>
                    
                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/map" className="text-white hover:text-gray-300 transition-colors">Map</Link>
                        <Link to="/gedung" className="text-white hover:text-gray-300 transition-colors">Gedung</Link>
                        {user && (
                            <Link to="/my-reservations" className="text-white hover:text-gray-300 transition-colors">
                                Reservasiku
=======
=======
>>>>>>> Stashed changes
                    <Link to="/" className="text-2xl font-bold text-white font-qanelas">Room Reservation</Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {filteredLinks.map(link => (
                            <Link 
                                key={link.path}
                                to={link.path}
                                className={`text-white hover:text-primary-yellow transition-colors px-3 py-2 rounded-md font-medium ${
                                    location.pathname === link.path ? 'bg-bem-darkblue' : ''
                                }`}
                            >
                                {link.label}
>>>>>>> Stashed changes
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
                                    className="flex items-center gap-1 font-bold text-l hover:text-primary-yellow transition-colors"
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                                    <div className="absolute top-full right-0 mt-2 bg-gray-700 rounded-md shadow-lg p-2 min-w-[160px] z-20">
                                        <Link 
                                            to="/profile" 
                                            className="block w-full text-left py-2 px-3 hover:bg-gray-600 rounded transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                handleLogout();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left py-2 px-3 hover:bg-gray-600 rounded transition-colors mt-1"
=======
=======
>>>>>>> Stashed changes
                                    <div className="absolute top-full right-0 mt-2 bg-bem-darkblue rounded-md shadow-lg p-2 min-w-[160px] z-20">
                                        <Link
                                            to="/profile"
                                            className="block w-full text-left py-2 px-3 hover:bg-primary-blue rounded transition-colors"
                                            onClick={closeDropdown}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={onLogout}
                                            className="block w-full text-left py-2 px-3 hover:bg-primary-blue rounded transition-colors mt-1"
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-primary-yellow font-medium">Login</Link>
                            <Link to="/register" className="bg-primary-yellow text-primary-blue hover:bg-yellow-400 py-1 px-4 rounded transition-colors font-semibold">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
                <div className="lg:hidden bg-bem-darkblue mt-3 p-3 rounded-md">
                    <div className="flex flex-col space-y-2">
                        {filteredLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center text-white py-2 px-3 hover:bg-primary-blue rounded ${
                                    location.pathname === link.path ? 'bg-primary-blue' : ''
                                }`}
                                onClick={closeMobileMenu}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                            <>
                                <Link 
                                    to="/profile" 
                                    className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
=======
=======
>>>>>>> Stashed changes
                            <div className="pt-2 mt-2 border-t border-primary-blue">
                                <Link
                                    to="/profile"
                                    className="flex items-center text-white py-2 px-3 hover:bg-primary-blue rounded"
                                    onClick={closeMobileMenu}
>>>>>>> Stashed changes
                                >
                                    Profile
                                </Link>
                                <button 
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                                    className="text-left text-white py-2 px-3 hover:bg-gray-600 rounded w-full"
=======
                                    className="flex items-center w-full text-left text-white py-2 px-3 hover:bg-primary-blue rounded"
>>>>>>> Stashed changes
=======
                                    className="flex items-center w-full text-left text-white py-2 px-3 hover:bg-primary-blue rounded"
>>>>>>> Stashed changes
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
=======
=======
>>>>>>> Stashed changes
                            <div className="pt-2 mt-2 border-t border-primary-blue flex flex-col space-y-2">
                                <Link
                                    to="/login"
                                    className="flex items-center text-white py-2 px-3 hover:bg-primary-blue rounded"
                                    onClick={closeMobileMenu}
>>>>>>> Stashed changes
                                >
                                    Login
                                </Link>
<<<<<<< Updated upstream
                                <Link 
                                    to="/register" 
                                    className="text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
=======
                                <Link
                                    to="/register"
                                    className="flex items-center text-primary-blue py-2 px-3 bg-primary-yellow hover:bg-yellow-400 rounded font-semibold"
                                    onClick={closeMobileMenu}
>>>>>>> Stashed changes
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