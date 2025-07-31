import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Share2, Download } from 'lucide-react';

interface QRCodeProps {
  value: string;
  size?: number;
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  onShare?: () => void;
  onDownload?: () => void;
}

export function QRCode({
  value,
  size = 256,
  includeMargin = true,
  imageSettings,
  onShare,
  onDownload
}: QRCodeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <QRCodeSVG
          id="qr-code-svg"
          value={value}
          size={size}
          level="H" // Increase error correction level for better reliability
          includeMargin={includeMargin}
          imageSettings={imageSettings}
        />
      </div>
    </div>
  );
}