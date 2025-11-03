import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;


console.log("URL:", SUPABASE_URL); 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Save JWT for API calls
      localStorage.setItem('access_token', data.session.access_token);
      console.log('Logged in. JWT:', data.session.access_token);

      const user = data.user;
      const uid = user.id;
      const userEmail = user.email;

      try {
        const { data: rows, error: fetchError } = await supabase
          .from('users')
          .select('uid')
          .eq('uid', uid)
          .limit(1);

        if (fetchError) throw fetchError;

        if (!rows || rows.length === 0) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ uid, email: userEmail }]);

          if (insertError) throw insertError;

          console.log('Created users row for', uid);
        } else {
          console.log('Users row already exists for', uid);
          
          // Check suspension/ban flags for existing user row
          const { data: userRow, error: rowError } = await supabase
            .from('users')
            .select('is_suspended,is_banned')
            .eq('uid', uid)
            .single();

          if (rowError) throw rowError;

          if (userRow?.is_suspended) {
            await supabase.auth.signOut();
            localStorage.removeItem('access_token');
            setErrorMsg('Your account has been suspended. Please contact support.');
            return;
          }

          if (userRow?.is_banned) {
            await supabase.auth.signOut();
            localStorage.removeItem('access_token');
            setErrorMsg('Your account has been banned.');
            return;
          }
        }
      } catch (err) {
        console.error('Error syncing user row:', err);
        setErrorMsg(err.message || 'Failed to sync user record');
      }

      // Navigate to user page
      navigate('/UserHomePage');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Phone Frame */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* Logo */}
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold">TransitGo</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200">
            <button
              className="flex-1 py-3 text-center font-medium text-black border-b-2 border-black"
            >
              Login
            </button>
            <button
              className="flex-1 py-3 text-center font-medium text-gray-400"
              onClick={() => navigate('/signup')}
            >
            Sign Up
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username/Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMsg && (
              <p className="text-red-600 text-sm">{errorMsg}</p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </button>

            <button
              onClick={handleForgotPassword}
              className="w-full text-blue-600 text-sm hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          {/* Home Indicator */}
          <div className="pb-2 flex justify-center">
            <div className="w-32 h-1 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
