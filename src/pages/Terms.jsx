import React from 'react';
import Layout from '../components/Layout';


function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">

       
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Terms and Conditions</h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-gray-700">
          <p className="mb-4 text-sm text-gray-500">Last Updated: July 16, 2025</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">1. Using Our Service</h2>
            <p>
              By using Attendance Register, you agree to follow these terms. If you don’t agree, please don’t use our service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">2. Account Rules</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use accurate and up-to-date info when signing up.</li>
              <li>Keep your password safe. You're responsible for your account.</li>
              <li>Let us know if you think someone’s misusing your account.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">3. Acceptable Use</h2>
            <p>
              Use the service legally and respectfully. Don’t post harmful or false information, and don’t break any laws.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">4. Your Content</h2>
            <p>
              You own your content but give us permission to use it within the service. Don’t upload anything illegal or offensive.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">5. Intellectual Property</h2>
            <p>
              All content and code on Attendance Register is owned by us. Don’t copy or use it without permission.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">6. Suspension or Termination</h2>
            <p>
              We can suspend or remove your account if you violate these terms. You can also stop using the service at any time.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">7. Limitation of Liability</h2>
            <p>
              We are not responsible for any loss or damage caused by using our service. You use it at your own risk.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">8. Updates to Terms</h2>
            <p>
              We may update these terms occasionally. If you keep using the service after changes, you agree to the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
            <p>
              Questions? Email us at{' '}
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

export default Terms;
