import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
    variant?: 'default' | 'auth';
    actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default', actionButton }) => {
    const user = useAuthStore(state => state.user);

    return (
        <header className="bg-white border-b border-border-light sticky top-0 z-30 px-4 md:px-10 py-3">
            <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-4 text-text-main hover:opacity-80 transition-opacity">
                    <div className="size-8 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C35.0457 4 44 12.9543 44 24Z" fill="currentColor" fillOpacity="0.1"></path>
                            <path d="M24 10V38" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
                            <path d="M10 24H38" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
                        </svg>
                    </div>
                    <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em]">Smart Restaurant</h2>
                </Link>

                {/* RIGHT CONTENT */}
                <div className="flex items-center gap-4">
                    {variant === 'default' ? (
                        <>
                            <Link to="/login" className="flex items-center gap-2 p-2 text-text-secondary hover:text-primary transition-colors" title="Login">
                                <User size={22} />
                                <span className="text-sm font-medium text-text-main">
                                    {user ? user.fullName : 'Khách'}
                                </span>
                            </Link>
                        </>
                    ) : (
                        <>
                            {actionButton}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
