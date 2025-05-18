import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavBar({ user, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Close dropdown and mobile menu when route changes
    useEffect(() => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Menu links based on user role
    const menuLinks = [
        { 
            path: '/map', 
            label: 'Peta Gedung', 
            icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
            roles: ['all'] 
        },
        { 
            path: '/gedung', 
            label: 'Gedung', 
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            roles: ['all'] 
        },
        { 
            path: '/reservation', 
            label: 'Reservasi Ruangan', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            roles: ['user', 'admin'] 
        },
        { 
            path: '/my-reservations', 
            label: 'Reservasiku', 
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            roles: ['user', 'admin'] 
        },
        { 
            path: '/admin/dashboard', 
            label: 'Dashboard Admin', 
            icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
            roles: ['admin'] 
        },
        { 
            path: '/approval', 
            label: 'Approval Reservasi', 
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            roles: ['admin'] 
        }
    ];

    // Filter menu links based on user role
    const filteredLinks = menuLinks.filter(link => {
        if (link.roles.includes('all')) return true;
        if (!user) return false;
        if (link.roles.includes('user')) return true;
        if (link.roles.includes('admin') && user.role === 'admin') return true;
        return false;
    });

    return (
        <nav className="fixed top-0 left-0 right-0 w-full bg-gray-800 text-white p-3 shadow-md z-50 opacity-95 border-b-2 border-blue-100">
            <div className="w-full px-4 flex justify-between items-center">
                {/* Logo and main navigation */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-2xl font-bold text-white">Room Reservation</Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {filteredLinks.map(link => (
                            <Link 
                                key={link.path}
                                to={link.path}
                                className={`text-white hover:text-gray-300 transition-colors px-3 py-2 rounded-md ${
                                    location.pathname === link.path ? 'bg-gray-700' : ''
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="lg:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white p-1"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4" ref={dropdownRef}>
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
                                            onClick={closeDropdown}
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
                <div className="lg:hidden bg-gray-700 mt-3 p-3 rounded-md">
                    <div className="flex flex-col space-y-2">
                        {filteredLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center text-white py-2 px-3 hover:bg-gray-600 rounded ${
                                    location.pathname === link.path ? 'bg-gray-600' : ''
                                }`}
                                onClick={closeMobileMenu}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                </svg>
                                {link.label}
                            </Link>
                        ))}

                        {user ? (
                            <div className="pt-2 mt-2 border-t border-gray-600">
                                <Link
                                    to="/profile"
                                    className="flex items-center text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={closeMobileMenu}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        onLogout();
                                        closeMobileMenu();
                                    }}
                                    className="flex items-center w-full text-left text-white py-2 px-3 hover:bg-gray-600 rounded"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 mt-2 border-t border-gray-600 flex flex-col space-y-2">
                                <Link
                                    to="/login"
                                    className="flex items-center text-white py-2 px-3 hover:bg-gray-600 rounded"
                                    onClick={closeMobileMenu}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center text-white py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded"
                                    onClick={closeMobileMenu}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default NavBar;