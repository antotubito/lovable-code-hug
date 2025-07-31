import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function PrivacyPolicy() {
  const location = useLocation();
  const isInApp = location.pathname.startsWith('/app');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
              <Link
                to={isInApp ? "/app" : "/waitlist"}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {isInApp ? 'Back to App' : 'Back to Home'}
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At Dislink, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our service.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Professional details (job title, company)</li>
              <li>Profile information and preferences</li>
              <li>Social media handles and links</li>
              <li>Connection history and meeting notes</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you use our service, we automatically collect:</p>
            <ul>
              <li>Device information</li>
              <li>Usage data and analytics</li>
              <li>Location data (with your permission)</li>
              <li>Log data and cookies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            <ul>
              <li>Providing and improving our services</li>
              <li>Facilitating connections between users</li>
              <li>Personalizing your experience</li>
              <li>Communicating with you</li>
              <li>Ensuring security and preventing fraud</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Other users (based on your privacy settings)</li>
              <li>Service providers and partners</li>
              <li>Legal authorities when required</li>
            </ul>

            <h2>5. Your Privacy Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>7. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect 
              information from children under 13.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@dislink.com
            </p>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Last updated: February 15, 2024
                <br />
                Effective date: February 15, 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}