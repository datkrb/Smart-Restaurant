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
                    <div className="size-8 text-primary font-bold text-orange-600">
                        SR
                    </div>
                    <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em]">Smart Restaurant</h2>
                </Link>

                {/* RIGHT CONTENT */}
                <div className="flex items-center gap-4">
                    {variant === 'default' ? (
                        <>
                            <Link
                                to={user?.role === 'CUSTOMER' ? "/profile" : "/login"}
                                className="flex items-center gap-2 p-2 text-text-secondary hover:text-primary transition-colors"
                                title={user?.role === 'CUSTOMER' ? "My Profile" : "Login"}
                            >
                                <User size={22} />
                                <span className="text-sm font-medium text-text-main">
                                    {user ? user.fullName : 'Guest'}
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
