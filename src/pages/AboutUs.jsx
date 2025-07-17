import React from 'react';
import Layout from '../components/Layout';
import AdBanner from '../components/AdBanner';


function AboutUs() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">About Us</h1>
        <div className="my-6">
        <div className="w-full flex justify-center items-center">
          <div className="w-full md:w-[728px] max-w-full">
            <AdBanner />
          </div>
        </div>
      </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {/* Our Mission */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At Attendance Register, our mission is to simplify attendance tracking for educational institutions and organizations. We believe that efficient attendance management leads to improved accountability, better resource allocation, and enhanced learning outcomes.
            </p>
            <p className="text-gray-600">
              By providing intuitive tools for recording, analyzing, and reporting attendance data, we aim to free educators and administrators from tedious manual processes so they can focus on what matters most: quality education and student success.
            </p>
          </section>

          {/* Our Values */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Simplicity</h3>
                <p className="text-gray-600">
                  We believe technology should simplify, not complicate. Our platform is designed to be intuitive and accessible to users of all technical backgrounds.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Reliability</h3>
                <p className="text-gray-600">
                  Education depends on consistent systems. Our platform prioritizes stability, accuracy, and dependability.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Innovation</h3>
                <p className="text-gray-600">
                  We continuously improve our platform with new features and capabilities based on user feedback and emerging technologies.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Privacy</h3>
                <p className="text-gray-600">
                  We respect user privacy and implement strong data protection measures to ensure sensitive information remains secure.
                </p>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Our Team</h2>
            <p className="text-gray-600 mb-4">
              Attendance Register is powered by a passionate team of educators, developers, and designers who share a common vision: to transform attendance tracking from a mundane administrative task into a valuable educational tool.
            </p>
            <p className="text-gray-600">
              Our team combines expertise in education, software development, data analysis, and user experience design to create a platform that truly meets the needs of educational institutions.
            </p>
          </section>

          {/* Get in Touch */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Get in Touch</h2>
            <p className="text-gray-600 mb-4">
              We love hearing from our users and are always open to feedback, suggestions, and collaborations. If you'd like to connect with our team:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-700">
                Email us at <a href="mailto:pvmohaneswar@gmail.com" className="text-blue-600 hover:underline">pvmohaneswar@gmial.com</a>
              </p>
              <p className="text-gray-700 mt-2">
                Visit our <a href="/contact-us" className="text-blue-600 hover:underline">contact page</a> for more ways to reach us
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default AboutUs;
