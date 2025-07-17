import React from 'react';
import Layout from '../components/Layout';

function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
      <AdBanner />
    </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Privacy Policy</h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-gray-700">
          <p className="mb-4 text-sm text-gray-500">Last Updated: July 16, 2025</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p>
              We value your privacy. This policy explains how we collect, use, and protect your data when you use Attendance Register.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">What We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name and email</li>
              <li>Attendance and course details</li>
              <li>IP address and browser info</li>
              <li>How you use our site</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">How We Use It</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manage your account and attendance</li>
              <li>Generate reports</li>
              <li>Improve our service</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Keeping Data Safe</h2>
            <p>
              We protect your data using secure systems and restrict access only to authorized personnel.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
            <p>
              We keep your data only as long as necessary and in line with legal requirements.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access or update your data</li>
              <li>Request deletion</li>
              <li>Limit or object to its use</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p>
              For any questions, email us at{' '}
              <a href="mailto:pvmohaneswar@gmail.com" className="text-blue-600 hover:underline">
                pvmohaneswar@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default PrivacyPolicy;
