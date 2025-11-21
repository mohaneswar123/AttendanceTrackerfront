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

        <ol className="list-decimal list-inside space-y-2 text-sm text-light-primary/90 mb-6 font-semibold">
          <li>
            Use the UPI QR below to pay <span className="font-bold">₹5</span> per month.
          </li>
          <li>
            After successful payment, send the <span className="font-bold">screenshot</span> and your <span className="font-bold">[username or registered mail]</span> to 
            <span className="font-bold text-light-primary"> attendanceinhand@gmail.com</span>.
          </li>
          <li>Screenshots are verified within a few minutes.</li>
        </ol>



        <div className="flex flex-col gap-3 mb-4">

          {/* <a
            href="upi://pay?pa=pvmohaneswar@oksbi&pn=Mohan%20Eswar&am=10&cu=INR&tn=Attendance%20Subscription"
            className="btn btn-primary w-full"
          >
            Pay Now
          </a> */}
          

          <a
            href="mailto:attendanceinhand@gmail.com?subject=Subscription%20Renewal&body=Hi,%20I%20have%20made%20the%20payment.%20Please%20find%20the%20screenshot%20attached.%20My%20username%20or%20registered%20mail%20is%20____."
            className="btn btn-primary w-full"
          >
            Send Email
          </a>


          <Link to="/login" className="btn btn-outline w-full">Go to Login</Link>
        </div>

        <div className="bg-dark-primary rounded-xl p-4 flex flex-col items-center gap-3 mb-6">
          <img src="/payment.png" alt="UPI QR" className="w-[300px] h-[300px] object-contain" />
        </div>

      </div>
    </div>
  );
}

export default InactivePage;
