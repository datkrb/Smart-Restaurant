import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');

    if (accessToken && refreshToken && role) {
      // Create a minimal user object since the redirect only provides basic info
      // We might want to fetch full profile later if needed, but for now this is enough to start session
      const user = {
        id: 'google-user', // Temporary ID
        name: 'Google User',
        email: '', 
        role: role as any,
        avatarUrl: '',
      };

      // Store tokens and update auth state
      login(user, accessToken, refreshToken);
      
      toast.success('Successfully logged in with Google!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Google login failed. Missing tokens.');
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-text-secondary font-medium">Completing login...</p>
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
