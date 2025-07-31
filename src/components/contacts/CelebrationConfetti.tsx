import React from 'react';
import { motion } from 'framer-motion';

interface CelebrationConfettiProps {
  onComplete: () => void;
}

export function CelebrationConfetti({ onComplete }: CelebrationConfettiProps) {
  // Generate confetti particles
  const particles = React.useMemo(() => Array.from({ length: 150 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth - window.innerWidth/2,
    y: -20 - Math.random() * 50,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    color: [
      '#FFD700', // Gold
      '#FF69B4', // Pink
      '#87CEEB', // Sky Blue
      '#98FB98', // Pale Green
      '#DDA0DD', // Plum
      '#F0E68C', // Khaki
      '#E6E6FA', // Lavender
      '#FFA500', // Orange
      '#00CED1', // Turquoise
      '#FF6B6B'  // Coral
    ][Math.floor(Math.random() * 10)]
  })), []);

  // Automatically trigger onComplete after animation
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Celebration Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        transition={{ duration: 0.5 }}
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-50"
      >
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-indigo-600 mb-4">
            🎉 Welcome to Dislink! 🎊
          </h2>
          <p className="text-xl text-gray-700">
            Your account is ready to go
          </p>
        </div>
      </motion.div>

      {/* Confetti Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `calc(50% + ${particle.x}px)`,
            y: particle.y,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: `calc(50% + ${particle.x + (Math.random() * 200 - 100)}px)`,
            y: `calc(100% + ${20 + Math.random() * 50}px)`,
            scale: particle.scale,
            rotate: particle.rotation + (Math.random() * 360)
          }}
          transition={{
            duration: 2.5 + Math.random(),
            ease: [0.23, 0.51, 0.32, 0.95],
            delay: Math.random() * 0.2
          }}
          className="absolute w-4 h-4"
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <svg viewBox="0 0 15 15" className="w-full h-full">
            {Math.random() > 0.5 ? (
              <rect
                width="15"
                height="15"
                fill={particle.color}
                opacity="0.8"
              />
            ) : (
              <circle
                cx="7.5"
                cy="7.5"
                r="7.5"
                fill={particle.color}
                opacity="0.8"
              />
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  );
}