import React from 'react';
import Layout from '../components/Layout';



function ContactUs() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-light-primary">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-dark-secondary rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-light-primary">Get in Touch</h2>
            <p className="text-light-primary mb-6">
              Have questions, feedback, or need assistance with our Attendance Register platform? We're here to help! Use one of the contact methods below.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-dark-primary p-3 rounded-full mr-4">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-light-primary">Email</h3>
                  <p className="text-light-primary">
                    <a href="mailto:pvmohaneswar@gmail.com" className="text-primary-500 hover:underline">pvmohaneswar@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-dark-primary">
              <h3 className="text-lg font-medium mb-3 text-light-primary">Connect With Us</h3>
              <div className="flex space-x-4">
                {/* Social media icons */}
                {/* Facebook */}
                <a href="#" className="bg-dark-primary hover:bg-primary-500 p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-light-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                </a>
                {/* Twitter */}
                <a href="#" className="bg-dark-primary hover:bg-primary-500 p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-light-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                {/* GitHub */}
                <a href="#" className="bg-dark-primary hover:bg-primary-500 p-2 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-light-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.646.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-light-primary">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-secondary rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium mb-2 text-light-primary">How do I reset my password?</h3>
              <p className="text-light-primary">
                If you forgot your password, please send a mail using your registered email address, and our team will send a password to your email.
              </p>
            </div>
            <div className="bg-dark-secondary rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium mb-2 text-light-primary">Can I print my attendance data?</h3>
              <p className="text-light-primary">
                Yes, you can print your attendance data. Go to the Reports section and use the print options available there.
              </p>
            </div>
            <div className="bg-dark-secondary rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium mb-2 text-light-primary">How do I add new subjects?</h3>
              <p className="text-light-primary">
                You can add new subjects by navigating to the Settings page and selecting "Manage Subjects". Click the "Add Subject" button and fill in the required information.
              </p>
            </div>
            <div className="bg-dark-secondary rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium mb-2 text-light-primary">Is there a mobile app available?</h3>
              <p className="text-light-primary">
                We are currently developing mobile apps for iOS and Android. In the meantime, our web application is fully responsive and works well on mobile browsers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ContactUs;
