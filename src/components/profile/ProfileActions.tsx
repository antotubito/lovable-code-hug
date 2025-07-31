import React, { useState } from 'react';
import { QrCode, Copy, Edit2, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { QRModal } from '../qr/QRModal';
import { QRScanner } from '../qr/QRScanner';
import { ConnectionConfirmation } from '../qr/ConnectionConfirmation';
import { validateQRCode, createConnectionRequest } from '../../lib/contacts';
import type { User } from '../../types/user';

interface ProfileActionsProps {
  user: User;
  onEdit: () => void;
}

export function ProfileActions({ user, onEdit }: ProfileActionsProps) {
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = async () => {
    try {
      const profileUrl = `${window.location.origin}/share/${user.id}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
      // Fallback to QR code if clipboard fails
      setShowQRModal(true);
    }
  };

  const handleScan = async (data: string) => {
    try {
      const scannedProfile = await validateQRCode(data);
      if (scannedProfile) {
        setScannedUser(scannedProfile);
        setShowConfirmation(true);
      } else {
        console.error('Invalid QR code');
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
    }
  };

  const handleConfirmConnection = async () => {
    if (!scannedUser) return;
    
    try {
      await createConnectionRequest(scannedUser);
      navigate('/app/contacts');
    } catch (error) {
      console.error('Error creating connection:', error);
    } finally {
      setShowConfirmation(false);
      setScannedUser(null);
    }
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-3 sm:hidden">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQRModal(true)}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <QrCode className="h-5 w-5 mr-2" />
          Show QR Code
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowScanner(true)}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Scan className="h-5 w-5 mr-2" />
          Scan QR
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyLink}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Copy className="h-5 w-5 mr-2" />
          Copy Profile Link
          {copySuccess && (
            <span className="ml-2 text-green-600">(Copied!)</span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Edit2 className="h-5 w-5 mr-2" />
          Edit Profile
        </motion.button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex sm:space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQRModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <QrCode className="h-5 w-5 mr-2" />
          Show QR Code
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowScanner(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Scan className="h-5 w-5 mr-2" />
          Scan QR
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Copy className="h-5 w-5 mr-2" />
          Copy Profile Link
          {copySuccess && (
            <span className="ml-2 text-green-600">(Copied!)</span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Edit2 className="h-5 w-5 mr-2" />
          Edit Profile
        </motion.button>
      </div>

      {/* Modals */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        user={user}
      />

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      {scannedUser && (
        <ConnectionConfirmation
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setScannedUser(null);
          }}
          onConfirm={handleConfirmConnection}
          user={scannedUser}
        />
      )}
    </>
  );
}