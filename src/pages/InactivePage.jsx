import React from 'react';
import { Link } from 'react-router-dom';

function InactivePage() {
  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-dark-secondary border border-dark-primary rounded-2xl shadow-md p-6 text-light-primary">
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Your subscription is inactive</h1>
          <p className="text-light-primary/80 mt-2 text-sm">Please renew to continue using Attendance Register.</p>
        </div>

        <ul className="list-disc list-inside space-y-1 text-sm text-light-primary/90 mb-6 font-bold">
          <li>Use the UPI QR below to pay 10 rupees.</li>
          <li>After successful payment, you have send screenshot to mobile number : 7416549717.</li>
          <li>Screenshots are verified within a few minutes.</li>
          
        </ul>

        <div className="bg-dark-primary rounded-xl p-4 flex flex-col items-center gap-3 mb-6">
          <img src="/image.png" alt="UPI QR" className="w-[300px] h-[300px] object-contain" />
        </div>



        <div className="flex justify-between gap-3 text-sm">
          <Link to="/login" className="btn btn-outline w-full">Go to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default InactivePage;
