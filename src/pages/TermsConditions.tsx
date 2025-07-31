import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function TermsConditions() {
  const location = useLocation();
  const isInApp = location.pathname.startsWith('/app');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
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
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Dislink ("Service"), you agree to be bound by these Terms and 
              Conditions. If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2>2. User Accounts</h2>
            <p>When creating an account with us, you must provide accurate and complete information.</p>
            <ul>
              <li>You are responsible for maintaining account security</li>
              <li>You must notify us of any unauthorized access</li>
              <li>You may not use another user's account</li>
              <li>You may not share your account credentials</li>
            </ul>

            <h2>3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Share inappropriate or offensive content</li>
              <li>Attempt to access unauthorized areas of the service</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by 
              Dislink and are protected by international copyright, trademark, patent, trade 
              secret, and other intellectual property laws.
            </p>

            <h2>5. User Content</h2>
            <p>
              By posting content on the Service, you grant us the right to use, modify, publicly 
              perform, publicly display, reproduce, and distribute such content on and through the Service.
            </p>

            <h2>6. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites or services that are not owned 
              or controlled by Dislink. We assume no responsibility for third-party content, 
              privacy policies, or practices.
            </p>

            <h2>7. Service Modifications</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the 
              Service with or without notice.
            </p>

            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason, including breach of these Terms.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall Dislink be liable for any indirect, incidental, special, 
              consequential, or punitive damages.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of 
              Portugal, without regard to its conflict of law provisions.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through the Service.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              For any questions about these Terms, please contact us at:
              <br />
              Email: legal@dislink.com
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