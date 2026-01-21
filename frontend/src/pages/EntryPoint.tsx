import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { guestApi } from '../api/guestApi';
import { useSessionStore } from '../store/useSessionStore';
import { useAuthStore } from '../store/useAuthStore';
import { QrCode, Utensils, AlertCircle, User, LogOut } from 'lucide-react';

const EntryPoint = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const { user, logout } = useAuthStore();
  const tableId = searchParams.get('tableId');
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // QR Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Initialize Scanner when modal opens
  useEffect(() => {
    let html5QrCode: any;
    
    if (showScanner) {
      import('html5-qrcode').then(({ Html5Qrcode }) => {
        html5QrCode = new Html5Qrcode("reader");
      });
    }

    return () => {
       if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch((err: any) => console.error(err));
       }
    };
  }, [showScanner]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setScanError(null);
      
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const html5QrCode = new Html5Qrcode("reader");
        const decodedText = await html5QrCode.scanFile(file, true);
        
        console.log("Scanned from file:", decodedText);
        setShowScanner(false);
        window.location.href = decodedText;
      } catch (err) {
        console.error(err);
        setScanError("Could not find a valid QR code in this image. Please try a clearer image.");
      }
    }
  };

  const startCamera = async () => {
     setScanError(null);
     try {
       const { Html5Qrcode } = await import('html5-qrcode');
       const html5QrCode = new Html5Qrcode("reader");
       
       await html5QrCode.start(
         { facingMode: "environment" },
         { fps: 10, qrbox: { width: 250, height: 250 } },
         (decodedText: string) => {
            console.log("Scanned from camera:", decodedText);
            html5QrCode.stop();
            setShowScanner(false);
            window.location.href = decodedText;
         },
         (errorMessage: string) => {
           // Parse error, ignore common scanning errors
         }
       );
     } catch (err) {
       console.error("Camera start failed", err);
       setScanError("Failed to access camera. Please check permissions.");
     }
  };

  useEffect(() => {
    if (tableId && token) {
      setIsLoading(true);
      guestApi.startSession(tableId, token)
        .then((res: any) => {
          const sessionId = res.session?.id || res.id;
          setSession(tableId, sessionId);
          navigate('/menu');
        })
        .catch((err) => {
          console.error(err);
          // Show user-friendly error from backend (e.g. "Invalid or expired QR code")
          const msg = err.response?.data?.error || "Invalid table or server connection error.";
          setError(msg);
        })
        .finally(() => setIsLoading(false));
    } else if (tableId && !token) {
      setError("This QR code is invalid (missing security token). Please ask staff for a new QR code.");
    }
  }, [tableId, token, navigate, setSession]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // No tableId - show welcome screen
  if (!tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
        {/* QR SCANNER MODAL */}
        {showScanner && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md relative flex flex-col items-center">
              <button
                onClick={() => setShowScanner(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4 text-center">Scan Table QR</h3>
              
              {/* Camera Viewport */}
              <div id="reader" className="w-full bg-gray-100 rounded-lg overflow-hidden min-h-[300px] mb-4 relative">
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-sm">Camera inactive</p>
                 </div>
              </div>

              {scanError && (
                 <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg w-full text-center">
                    {scanError}
                 </div>
              )}

              <div className="flex flex-col gap-3 w-full">
                 <button 
                   onClick={startCamera}
                   className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                 >
                    <QrCode size={18} /> Use Camera
                 </button>
                 
                 <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center">
                       Upload QR Image
                    </button>
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Utensils size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-800">SmartFood</span>
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors"
                >
                  <User size={16} />
                  <span className="max-w-[100px] truncate">{user.fullName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-200">
              <QrCode size={48} className="text-white" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Welcome to <span className="text-orange-500">SmartFood</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed">
              Scan the QR code at your table to start ordering delicious food
            </p>

            {/* Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 mb-6">
              <div className="flex items-start gap-4 text-left">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">How to order</h3>
                  <ol className="text-gray-500 text-xs space-y-1">
                    <li>1. Scan QR code at your table</li>
                    <li>2. Browse the menu & add items</li>
                    <li>3. Submit your order</li>
                    <li>4. Track & enjoy your meal!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Demo Link */}
            <div className="flex flex-col gap-3">
               <button
                  onClick={() => setShowScanner(true)}
                  className="mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
                >
                  <QrCode size={20} />
                  Scan Table QR
                </button>
                <p className="text-gray-400 text-xs">
                  No QR code? Ask your waiter for assistance.
                </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-gray-400 text-xs">
          <p>© 2026 SmartFood. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // Loading state when tableId exists
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Connection Error</h2>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Setting up your table</h2>
            <p className="text-gray-500 text-sm animate-pulse">Verifying table information...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default EntryPoint;