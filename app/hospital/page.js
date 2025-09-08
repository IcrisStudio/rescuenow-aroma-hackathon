import React from 'react';
import Link from 'next/link';

const HospitalPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-10 text-center drop-shadow-lg">
        🏥 Hospital Portal
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/hospital/login">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">Hospital Login</h2>
            <p className="text-gray-600">Access your hospital dashboard and manage operations.</p>
          </div>
        </Link>

        <Link href="/hospital/register">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-2xl font-semibold text-green-600 mb-2">Hospital Registration</h2>
            <p className="text-gray-600">Register your hospital and join the Rescue Now network.</p>
          </div>
        </Link>

        <Link href="/hospital/ambulance">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:scale-105 transition-transform cursor-pointer">
            <h2 className="text-2xl font-semibold text-red-600 mb-2">Ambulance Driver Portal</h2>
            <p className="text-gray-600">Manage ambulance operations and respond to emergencies.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HospitalPage;
