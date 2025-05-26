import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavBar({ user, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeHover, setActiveHover] = useState(null);
    const dropdownRef = useRef(null);
    const location = useLocation();

    // Scroll effect untuk navbar
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <>
            {/* Enhanced CSS Styles for animations */}
            <style jsx>{`
                /* Advanced Logo Animation */
                .logo-container {
                    position: relative;
                    display: inline-block;
                    padding: 4px 8px; /* Add padding untuk space */
                }
                
                .logo-main {
                    display: inline-block;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-origin: center;
                }
                
                .logo-container:hover .logo-main {
                    transform: scale(1.05);
                    text-shadow: 0 4px 8px rgba(255, 193, 7, 0.5);
                }

                /* Magnetic hover effect for nav links */
                .nav-link {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .nav-link::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.4), transparent);
                    transition: left 0.5s;
                }
                
                .nav-link:hover::before {
                    left: 100%;
                }
                
                .nav-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
                }

                /* Floating animation for icons */
                .floating-icon {
                    animation: float 3s ease-in-out infinite;
                }
                
                .floating-icon:nth-child(2n) {
                    animation-delay: -1.5s;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }

                /* Morphing hamburger menu */
                .hamburger-line {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform-origin: center;
                }
                
                .hamburger-open .hamburger-line:nth-child(1) {
                    transform: rotate(45deg) translate(6px, 6px);
                }
                
                .hamburger-open .hamburger-line:nth-child(2) {
                    opacity: 0;
                    transform: scale(0);
                }
                
                .hamburger-open .hamburger-line:nth-child(3) {
                    transform: rotate(-45deg) translate(6px, -6px);
                }

                /* Glassmorphism dropdown */
                .glass-dropdown {
                    backdrop-filter: blur(20px);
                    background: rgba(30, 58, 138, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                /* Sliding mobile menu */
                .mobile-menu {
                    transform: translateY(-20px);
                    opacity: 0;
                    animation: slideInDown 0.3s ease-out forwards;
                }
                
                @keyframes slideInDown {
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                /* Pulse animation for active items */
                .pulse-glow {
                    animation: pulseGlow 2s ease-in-out infinite;
                }
                
                @keyframes pulseGlow {
                    0%, 100% {
                        box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
                    }
                }

                /* Smooth navbar transition */
                .navbar-scrolled {
                    backdrop-filter: blur(20px);
                    background: rgba(37, 99, 235, 0.95);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                /* Ripple effect */
                .ripple {
                    position: relative;
                    overflow: hidden;
                }
                
                .ripple::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 193, 7, 0.5);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }
                
                .ripple:active::after {
                    width: 300px;
                    height: 300px;
                }

                /* Button hover morphing */
                .morph-button {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    overflow: hidden;
                }
                
                .morph-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transition: left 0.5s;
                }
                
                .morph-button:hover::before {
                    left: 100%;
                }
                
                .morph-button:hover {
                    transform: perspective(1000px) rotateX(10deg) scale(1.05);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                /* Text reveal animation - Fixed */
                .text-reveal {
                    position: relative;
                    display: inline-block;
                }
                
                .text-reveal::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 0%;
                    height: 100%;
                    background: rgba(255, 193, 7, 0.3);
                    transition: width 0.3s ease-out;
                    z-index: -1;
                }
                
                .text-reveal:hover::after {
                    width: 100%;
                }
            `}</style>

            <nav className={`fixed top-0 left-0 right-0 w-full p-3 shadow-md z-50 transition-all duration-500 border-b-2 border-primary-yellow ${
                isScrolled 
                    ? 'navbar-scrolled' 
                    : 'bg-primary-blue text-white opacity-95'
            }`}>
                <div className="w-full px-4 flex justify-between items-center">
                    {/* Logo and main navigation */}
                    <div className="flex items-center gap-4">
                        {/* Enhanced Animated Logo */}
                        <Link to="/" className="text-2xl font-[950] text-white font-qanelas logo-container">
                            <span className="logo-main text-reveal">
                                Pinjam Ruang FT 2.0
                            </span>
                        </Link>

                        {/* Desktop Navigation Links with enhanced animations */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {filteredLinks.map((link, index) => (
                                <Link 
                                    key={link.path}
                                    to={link.path}
                                    className={`nav-link text-white hover:text-primary-yellow transition-all duration-300 px-4 py-2 rounded-lg font-medium ripple ${
                                        location.pathname === link.path ? 'bg-bem-darkblue pulse-glow' : ''
                                    }`}
                                    onMouseEnter={() => setActiveHover(index)}
                                    onMouseLeave={() => setActiveHover(null)}
                                    style={{
                                        transform: activeHover === index ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                        </svg>
                                        {link.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Mobile menu button */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className={`text-white p-2 rounded-lg transition-all duration-300 hover:bg-white/10 ${isMobileMenuOpen ? 'hamburger-open' : ''}`}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className="hamburger-line w-6 h-0.5 bg-current mb-1"></span>
                                <span className="hamburger-line w-6 h-0.5 bg-current mb-1"></span>
                                <span className="hamburger-line w-6 h-0.5 bg-current"></span>
                            </div>
                        </button>
                    </div>

                    {/* Enhanced Auth related links */}
                    <div className="hidden lg:flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-4" ref={dropdownRef}>
                                <div className="relative">
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center gap-2 font-bold text-lg hover:text-primary-yellow transition-all duration-300 px-3 py-2 rounded-lg morph-button"
                                    >
                                        <div className="w-8 h-8 bg-primary-yellow text-primary-blue rounded-full flex items-center justify-center font-bold text-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        {user.username}
                                        <svg
                                            className={`h-4 w-4 transition-all duration-300 ${isDropdownOpen ? 'rotate-180 scale-110' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-2 glass-dropdown rounded-xl shadow-xl p-3 min-w-[180px] z-20 animate-fade-in-down">
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 w-full text-left py-3 px-4 hover:bg-white/10 rounded-lg transition-all duration-300 text-white hover:scale-105"
                                                onClick={closeDropdown}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </Link>
                                            <button
                                                onClick={onLogout}
                                                className="flex items-center gap-3 w-full text-left py-3 px-4 hover:bg-red-500/20 rounded-lg transition-all duration-300 mt-1 text-white hover:scale-105"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-white hover:text-primary-yellow font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 morph-button"
                                >
                                    Masuk
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-primary-yellow text-primary-blue hover:bg-red-500 hover:text-white py-2 px-6 rounded-lg transition-all duration-300 font-semibold hover:shadow-lg transform hover:scale-105"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Enhanced Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden glass-dropdown mt-4 p-4 rounded-xl mobile-menu">
                        <div className="flex flex-col space-y-1">
                            {filteredLinks.map((link, index) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center text-white py-3 px-4 hover:bg-white/10 rounded-lg transition-all duration-300 morph-button ${
                                        location.pathname === link.path ? 'bg-primary-blue pulse-glow' : ''
                                    }`}
                                    onClick={closeMobileMenu}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animation: 'slideInDown 0.3s ease-out forwards'
                                    }}
                                >
                                    <svg className="w-5 h-5 mr-3 floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                                    </svg>
                                    {link.label}
                                </Link>
                            ))}

                            {user ? (
                                <div className="pt-3 mt-3 border-t border-white/20">
                                    <div className="flex items-center gap-3 py-2 px-4 text-white">
                                        <div className="w-10 h-10 bg-primary-yellow text-primary-blue rounded-full flex items-center justify-center font-bold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold">{user.username}</span>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center text-white py-3 px-4 hover:bg-white/10 rounded-lg transition-all duration-300 morph-button"
                                        onClick={closeMobileMenu}
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            closeMobileMenu();
                                        }}
                                        className="flex items-center w-full text-left text-white py-3 px-4 hover:bg-red-500/20 rounded-lg transition-all duration-300 morph-button"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-3 mt-3 border-t border-white/20 flex flex-col space-y-2">
                                    <Link
                                        to="/login"
                                        className="flex items-center text-white py-3 px-4 hover:bg-white/10 rounded-lg transition-all duration-300 morph-button"
                                        onClick={closeMobileMenu}
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex items-center text-primary-blue py-3 px-4 bg-primary-yellow hover:bg-yellow-400 rounded-lg font-semibold transition-all duration-300 morph-button"
                                        onClick={closeMobileMenu}
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </>
    );
}

export default NavBar;