import {useState} from 'react';
import {Link} from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Header } from '../../components/common/Header';
import { KeyRound, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setIsSuccess(false);
        try {
            await authApi.forgotPassword(email);
            setIsSuccess(true);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="font-sans bg-background-light min-h-screen flex flex-col text-text-main">


      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="layout-content-container flex flex-col max-w-[480px] w-full bg-white p-8 rounded-xl shadow-sm border border-border-light">
          
          {/* SUCCESS STATE */}
          {isSuccess ? (
             <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                </div>
                <h1 className="text-text-main text-[32px] font-bold leading-tight pb-2">Check your email</h1>
                <p className="text-text-secondary text-base font-normal leading-relaxed pb-6">
                    We have sent a password reset link to <strong>{email}</strong>. Please check your inbox (and spam folder).
                </p>
                <Link to="/login" className="w-full">
                    <button className="w-full h-12 rounded-lg bg-primary text-white font-bold hover:bg-opacity-90 transition-colors">
                        Back to Login
                    </button>
                </Link>
             </div>
          ) : (
            /* FORM STATE */
            <>
                {/* Icon Section */}
                <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <KeyRound className="text-primary w-10 h-10" />
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-text-main text-[32px] font-bold leading-tight text-center pb-2">Forgot Password?</h1>
                
                {/* Body Text */}
                <p className="text-text-secondary text-base font-normal leading-relaxed pb-6 text-center">
                    No worries! Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                {/* Error Notification */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col w-full">
                        <label className="flex flex-col w-full">
                            <p className="text-text-main text-base font-medium leading-normal pb-2">Email Address</p>
                            <input 
                                required
                                type="email"
                                className="flex w-full rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary border border-border-light bg-white h-14 placeholder:text-text-secondary/50 px-4 text-base font-normal leading-normal transition-all hover:bg-input-bg focus:bg-white" 
                                placeholder="e.g. alex@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="flex pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm transition-all">
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center">
        <p className="text-text-secondary text-xs flex items-center justify-center gap-1">
          <ShieldCheck size={14} />
          Secure Account Recovery Process
        </p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
