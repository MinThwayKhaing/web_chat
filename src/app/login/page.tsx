/* eslint-disable react/no-unescaped-entities */
// src/app/components/LoginPage.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const authtoken = await login(username, password);
      const user = await fetch('https://jsonplaceholder.typicode.com/users')
        .then(res => res.json())
        .then(users => users.find((u: { username: string }) => u.username === username));
      if (user) {
        router.push('/home');
        // if (user.userrole === 'admin') {
        //   router.push('/admin');
        // } else {
        //   router.push('/home');
        // }
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
        <div className="flex flex-col space-y-4">
          <input 
            type="email" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Enter your Email" 
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your Password" 
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-500">Forgot Password?</a>
          </div>
          <button 
            onClick={handleLogin} 
            className="bg-blue-500 text-white rounded py-2 mt-4 hover:bg-blue-600 transition duration-200"
          >
            LOGIN
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="text-center my-4 text-sm">- OR -</div>
          <div className="flex justify-around">
            <button className="bg-gray-100 p-2 rounded-full shadow-md">
              {/* <img src="/facebook-icon.png" alt="Facebook" className="h-6 w-6" /> */}
            </button>
            <button className="bg-gray-100 p-2 rounded-full shadow-md">
              {/* <img src="/google-icon.png" alt="Google" className="h-6 w-6" /> */}
            </button>
          </div>
          <div className="text-center mt-4 text-sm">
            Don't have an Account? <a href="#" className="text-blue-500">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
