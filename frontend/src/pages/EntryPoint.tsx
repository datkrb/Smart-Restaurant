import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { guestApi } from '../api/guestApi';
import { useSessionStore } from '../store/useSessionStore';

const EntryPoint = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);
  const tableId = searchParams.get('tableId');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tableId) {
      guestApi.startSession(tableId)
        .then((res: any) => {
          // Fix: Extract session ID correctly from response
          const sessionId = res.session?.id || res.id;
          setSession(tableId, sessionId);
          navigate('/menu');
        })
        .catch((err) => {
          console.error(err);
          setError("Invalid table or server connection error.");
        });
    }
  }, [tableId, navigate, setSession]);

  if (!tableId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error: Table not found</h1>
        <p className="mt-2 text-gray-600">Please scan the QR code at your table to continue.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {error ? (
        <p className="text-red-500 font-bold">{error}</p>
      ) : (
        <p className="animate-pulse">Verifying table information...</p>
      )}
    </div>
  );
};

export default EntryPoint;