import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
              <Link
                to="/app/register"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Registration
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Dislink ("we," "our," or "us"). By using our service, you agree to these terms and conditions. 
              Please read them carefully before registering or using our platform.
            </p>

            <h2>2. GDPR Compliance</h2>
            <p>
              In accordance with the General Data Protection Regulation (GDPR), we are committed to protecting your personal data:
            </p>
            <ul>
              <li>We only collect data that is necessary for providing our service</li>
              <li>Your data is processed lawfully, fairly, and transparently</li>
              <li>You have the right to access, correct, or delete your personal data</li>
              <li>You can withdraw consent at any time</li>
              <li>We implement appropriate security measures to protect your data</li>
            </ul>

            <h2>3. Data Collection and Use</h2>
            <p>We collect and process the following types of data:</p>
            <ul>
              <li>Account information (name, email)</li>
              <li>Profile information you choose to share</li>
              <li>Connection and interaction data</li>
              <li>Technical data necessary for service operation</li>
            </ul>

            <h2>4. Your Rights Under GDPR</h2>
            <p>As a user based in the EU, you have the following rights:</p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Rights related to automated decision making</li>
            </ul>

            <h2>5. Data Storage and Security</h2>
            <p>
              Your data is stored securely within the European Union, in compliance with GDPR requirements. 
              We implement appropriate technical and organizational measures to ensure data security.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to provide our services 
              or to comply with legal obligations. You can request deletion of your account and associated 
              data at any time.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              When you connect third-party services to your profile, you agree to their respective terms 
              and privacy policies. We only share data with third parties with your explicit consent or 
              where necessary to provide our services.
            </p>

            <h2>8. Contact Information</h2>
            <p>
              For any questions about these terms or your data rights, contact our Data Protection Officer at:
              <br />
              Email: dpo@dislink.com
              <br />
              Address: [Your Portuguese Business Address]
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We may update these terms to reflect changes in our services or legal requirements. 
              We will notify you of any material changes.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These terms are governed by Portuguese law and EU regulations. Any disputes shall be subject 
              to the exclusive jurisdiction of the courts of Portugal.
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