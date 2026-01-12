import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Eye, EyeOff, User, Chrome, Smartphone } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Header } from '../../components/common/Header';
import toast from 'react-hot-toast';
import { LoginResponse } from '../../types/auth.types';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  // State quản lý form
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // LOGIN
        const data = await authApi.login(email, password);
        console.log(data);
        login(data.user, data.accessToken, data.refreshToken);
        console.log(data.user);
        toast.success("Welcome back!");
        if(data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // REGISTER
        // API now returns { message, user }, not the full login response with tokens
        const response = await authApi.register(email, password, fullName);
        
        toast.success(response.message || "Registration successful! Please check your email to verify account.");
        
        // Switch to login mode but don't auto-login
        setIsLoginMode(true);
        setPassword('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode: boolean) => {
    setIsLoginMode(mode);
    setError('');
    setPassword('');
  };

  return (
    <div className="font-sans bg-background-light min-h-screen flex flex-col text-text-main overflow-x-hidden">

      {/* MAIN CONTENT */}
      <main className="flex-1 flex justify-center py-5 px-4 md:px-10 lg:px-40">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
          <div className="@container h-full flex flex-col justify-center">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch h-full py-6">
              
              {/* LEFT SIDE: IMAGE */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div 
                  className="relative w-full h-64 lg:h-full min-h-[400px] bg-center bg-no-repeat bg-cover rounded-xl overflow-hidden shadow-lg" 
                  style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop")'}}
                >
                  <div className="absolute bottom-0 left-0 p-8 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">Taste the Future</h1>
                    <p className="text-base md:text-lg font-medium text-gray-200">Trải nghiệm hệ thống đặt món thông minh. Đăng nhập để quản lý nhà hàng của bạn.</p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: AUTH FORM */}
              <div className="w-full lg:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-[480px] flex flex-col gap-6 p-6 md:p-8 bg-white rounded-xl border border-border-light shadow-sm">
                  
                  {/* Title & Tabs */}
                  <div className="flex flex-col gap-4">
                    <div className="text-center md:text-left">
                      <h2 className="text-text-main text-2xl font-bold leading-tight">
                        {isLoginMode ? 'Welcome Back' : 'Create Account'}
                      </h2>
                      <p className="text-text-secondary text-sm font-normal mt-1">
                        {isLoginMode ? 'Đăng nhập vào hệ thống quản trị.' : 'Đăng ký tài khoản mới.'}
                      </p>
                    </div>
                    <div className="w-full mt-2">
                      <div className="flex border-b border-border-light">
                        <button 
                          onClick={() => toggleMode(true)}
                          className={`flex flex-col items-center justify-center border-b-[3px] ${isLoginMode ? 'border-b-primary text-text-main' : 'border-b-transparent text-text-secondary hover:text-text-main'} pb-[13px] pt-4 flex-1 transition-colors`}
                        >
                          <p className="text-sm font-bold leading-normal tracking-[0.015em]">Log In</p>
                        </button>
                        <button 
                          onClick={() => toggleMode(false)}
                          className={`flex flex-col items-center justify-center border-b-[3px] ${!isLoginMode ? 'border-b-primary text-text-main' : 'border-b-transparent text-text-secondary hover:text-text-main'} pb-[13px] pt-4 flex-1 transition-colors`}
                        >
                          <p className="text-sm font-bold leading-normal tracking-[0.015em]">Sign Up</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                        {error}
                      </div>
                    )}

                    {/* Full Name Input (Register Only) */}
                    {!isLoginMode && (
                      <div className="animate-in fade-in slide-in-from-bottom-2">
                        <Input
                          label="Full Name"
                          placeholder="John Doe"
                          required={!isLoginMode}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          leftIcon={<User size={20} />}
                        />
                      </div>
                    )}

                    {/* Email Input */}
                    <Input
                      label="Email"
                      type="email"
                      placeholder="admin@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail size={20} />}
                    />

                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-text-main text-sm font-medium leading-normal">Password</span>
                        {isLoginMode && <a className="text-primary text-sm font-medium hover:underline cursor-pointer" onClick={() => navigate('/forgot-password')}>Forgot?</a>}
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<Lock size={20} />}
                        rightIcon={
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="hover:text-text-main focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        }
                      />
                    </div>

                    {isLoginMode && (
                      <div className="flex items-center gap-2 my-1">
                        <input 
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                        />
                        <label className="text-text-secondary text-sm">Remember me</label>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      isLoading={isLoading}
                      fullWidth
                    >
                      {isLoginMode ? 'Log In' : 'Create Account'}
                    </Button>
                  </form>

                  {/* Social Login */}
                  <div className="flex flex-col gap-4">
                    <div className="relative flex items-center py-2">
                      <div className="grow border-t border-border-light"></div>
                      <span className="shrink-0 px-2 text-xs font-medium text-text-secondary uppercase">Or continue with</span>
                      <div className="grow border-t border-border-light"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => window.location.href = "http://localhost:4000/api/v1/auth/google"}
                        className="flex items-center justify-center gap-2 rounded-lg border border-border-light bg-white h-10 px-4 hover:bg-input-bg transition-colors"
                      >
                        <Chrome size={20} />
                        <span className="text-text-main text-sm font-bold">Google</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 rounded-lg border border-border-light bg-white h-10 px-4 hover:bg-input-bg transition-colors">
                        <Smartphone size={20} />
                        <span className="text-text-main text-sm font-bold">Apple</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-text-secondary mt-2">
                    By continuing, you agree to Smart Restaurant's <a className="underline hover:text-primary" href="#">Terms</a> and <a className="underline hover:text-primary" href="#">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;