// src/app/components/PermissionPage.tsx
"use client";
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';

const PermissionPage = () => {
 
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);
  if (!user) {
    return <p>Loading...</p>;
  }

  const isAdmin = user.userrole === 'admin';

  const goToHomePage = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600 p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Permission Page</h1>
        {isAdmin ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Admin Permissions</h2>
            <ul className="list-disc list-inside">
              <li>Read</li>
              <li>Write</li>
              <li>Delete</li>
            </ul>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">User Permissions</h2>
            <ul className="list-disc list-inside">
              <li>Read-only</li>
            </ul>
          </div>
        )}
        <button 
          onClick={goToHomePage} 
          className="bg-blue-500 text-white rounded py-2 mt-4 hover:bg-blue-600 transition duration-200 w-full"
        >
          Go to Home Page
        </button>
      </div>
    </div>
  );
};

export default PermissionPage;
