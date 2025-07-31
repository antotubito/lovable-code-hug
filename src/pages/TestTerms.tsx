import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TestTerms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Test User Terms</h1>
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
            <h2 className="text-xl font-bold mb-4">NON-DISCLOSURE AGREEMENT & TERMS OF USE FOR TEST USERS</h2>
            <p className="text-sm text-gray-500 mb-6">
              Effective Date: 30/01/2025<br />
              App Name: Dislink<br />
              Owner: Antonio Tubito<br />
              Jurisdiction: EU (Portuguese Law)
            </p>

            <h3>1. Introduction</h3>
            <p>
              This Non-Disclosure Agreement (NDA) and Terms of Use ("Agreement") governs the participation 
              of test users ("Tester") in accessing and evaluating the Dislink ("App") owned by Antonio Tubito. 
              By requesting and receiving access, the Tester agrees to be bound by this Agreement.
            </p>

            <h3>2. Confidentiality & Restrictions</h3>
            <p>
              The Tester acknowledges that the App is currently in a private testing phase and contains 
              confidential and proprietary information.
            </p>
            <p>The Tester shall not share, distribute, disclose, or publish any details about the App, including but not limited to:</p>
            <ul>
              <li>Features, functionalities, designs, and user experience</li>
              <li>Business strategy, technical architecture, and development plans</li>
              <li>Any screenshots, videos, or descriptions of the App</li>
            </ul>
            <p>No public feedback, reviews, or discussions regarding the App are allowed without prior written consent.</p>

            <h3>3. Ownership & Intellectual Property</h3>
            <p>
              All intellectual property rights, including but not limited to feedback, ideas, and suggestions 
              provided by the Tester, shall be the sole property of Antonio Tubito.
            </p>
            <p>
              The Tester shall not copy, reverse-engineer, or attempt to reproduce any element of the App.
            </p>

            <h3>4. Data Collection & Privacy</h3>
            <p>
              The App may collect certain user data, including location, behavior, and usage statistics for 
              testing purposes.
            </p>
            <p>
              The data will be handled in compliance with GDPR and other applicable data protection laws.
            </p>
            <p>
              The Tester consents to this data collection and agrees that all collected data remains the 
              property of Antonio Tubito.
            </p>

            <h3>5. Testing Period & Access</h3>
            <p>
              The Tester is granted access solely for evaluation purposes during the private testing phase.
            </p>
            <p>
              Access may be revoked at any time without notice.
            </p>

            <h3>6. Duration of Confidentiality</h3>
            <p>
              The confidentiality obligations shall remain in effect for a period of 3 years from the end 
              of the testing phase, or until the App is publicly launched, whichever occurs later.
            </p>

            <h3>7. Legal Consequences for Violations</h3>
            <p>
              Any breach of this Agreement may result in legal action, including claims for monetary damages 
              and injunctive relief.
            </p>
            <p>
              The Tester agrees to indemnify and hold harmless Antonio Tubito from any unauthorized use or 
              disclosure of confidential information.
            </p>

            <h3>8. Tester Information Requirement</h3>
            <p>To access the App, the Tester must provide:</p>
            <ul>
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Company Name (if applicable)</li>
            </ul>

            <h3>9. Governing Law & Dispute Resolution</h3>
            <p>
              This Agreement shall be governed by Portuguese Law under the jurisdiction of Tribunal de Lisboa.
            </p>
            <p>
              Any disputes arising from this Agreement shall be resolved through confidential arbitration in Portugal.
            </p>

            <h3>10. Acceptance of Terms</h3>
            <p>
              By requesting and receiving access to the App, the Tester acknowledges that they have read, 
              understood, and agreed to this NDA and Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}