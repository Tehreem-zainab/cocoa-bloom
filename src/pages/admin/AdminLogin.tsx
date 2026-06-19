import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';
import CustomCursor from '@/components/CustomCursor';

// Credentials loaded from environment variables
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER as string;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS as string;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('cb_admin', '1');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1810] flex items-center justify-center p-4 cursor-none">
      <CustomCursor />
      <div className="w-full max-w-sm bg-[#F5E6D3] rounded-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#C8975A]/10 rounded-full flex items-center justify-center mb-4">
            <Lock size={24} className="text-[#C8975A]" />
          </div>
          <h1 className="font-display text-2xl text-[#2C1810]">Cocoa Bloom</h1>
          <p className="font-body text-sm text-[#C4A882] mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-body text-sm text-[#C4A882] block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="font-body text-sm text-[#C4A882] block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#C4A882]/30 rounded font-body text-[#2C1810] focus:outline-none focus:border-[#C8975A]"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-[#B8324A]">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#C8975A] text-white font-display rounded hover:bg-[#C8975A]/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
