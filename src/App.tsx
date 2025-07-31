import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { SessionGuard } from './components/auth/SessionGuard';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Terms } from './pages/Terms';
import { TestTerms } from './pages/TestTerms';
import { Contacts } from './pages/Contacts';
import { Settings } from './pages/Settings';
import { ContactProfile } from './pages/ContactProfile';
import { PublicProfile } from './pages/PublicProfile';
import { Onboarding } from './pages/Onboarding';
import { Waitlist } from './pages/Waitlist';
import { TermsConditions } from './pages/TermsConditions';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Story } from './pages/Story';
import { EmailConfirmation } from './pages/EmailConfirmation';
import { EmailConfirm } from './pages/EmailConfirm';
import { Confirmed } from './pages/Confirmed';
import { ResetPassword } from './pages/ResetPassword';
import { Demo } from './pages/Demo';
import { ConnectionErrorBanner } from './components/ConnectionErrorBanner';
import { MobileAppBanner } from './components/MobileAppBanner';
import { isMobileApp } from './lib/mobileUtils';

function App() {
  const isRunningInMobileApp = isMobileApp();

  return (
    <AuthProvider>
      <SessionGuard>
        {!isRunningInMobileApp && <MobileAppBanner />}
        <ConnectionErrorBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Waitlist />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/share/:code" element={<PublicProfile />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/story" element={<Story />} />
          <Route path="/verify" element={<EmailConfirmation />} />
          <Route path="/confirm" element={<EmailConfirm />} />
          <Route path="/confirmed" element={<Confirmed />} />
          <Route path="/app/reset-password" element={<ResetPassword />} />
          <Route path="/demo" element={<Demo />} />
          
          {/* Production Channel Routes */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="test-terms" element={<TestTerms />} />
            <Route path="terms" element={<TermsConditions />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            
            {/* Protected Routes */}
            <Route
              path="contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="contact/:id"
              element={
                <ProtectedRoute>
                  <ContactProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to waitlist */}
          <Route path="*" element={<Navigate to="/waitlist" replace />} />
        </Routes>
      </SessionGuard>
    </AuthProvider>
  );
}

export default App;