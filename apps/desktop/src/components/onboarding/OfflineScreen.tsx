import { motion } from 'framer-motion';

export default function OfflineScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-8 overflow-hidden"
      style={{ background: 'rgba(10,4,18,0.94)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative max-w-md w-full text-center">
        {/* Dead ghost */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(124,58,237,0.1) 50%, transparent 75%)' }}
            />
            <svg width="110" height="120" viewBox="0 0 20 22" fill="none" className="relative">
              <defs>
                <linearGradient id="offlineGhost" x1="0" y1="0" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <path
                d="M10 1C5.5 1 2 4.5 2 9v8l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V9c0-4.5-3.5-8-8-8z"
                fill="rgba(236,72,153,0.08)"
                stroke="url(#offlineGhost)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* X eyes */}
              <g stroke="url(#offlineGhost)" strokeWidth="0.9" strokeLinecap="round">
                <line x1="6.3" y1="8.3" x2="8.7" y2="10.7" />
                <line x1="8.7" y1="8.3" x2="6.3" y2="10.7" />
                <line x1="11.3" y1="8.3" x2="13.7" y2="10.7" />
                <line x1="13.7" y1="8.3" x2="11.3" y2="10.7" />
              </g>
            </svg>
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-[24px] md:text-[28px] font-bold tracking-tight text-white mb-3"
          style={{ letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Oops —{' '}
          <span
            className="inline-block bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(120deg, #EC4899 0%, #7C3AED 100%)' }}
          >
            you're offline
          </span>
        </motion.h1>

        <motion.p
          className="text-[15px] text-white/55 mb-8 max-w-sm mx-auto leading-[1.55]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
        >
          Looks like you aren't connected to the internet. Ghost Session needs a live connection to sync with your collaborators.
        </motion.p>

        <motion.button
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-7 h-12 rounded-full text-white text-[15px] font-semibold"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
            boxShadow: '0 4px 14px rgba(124,58,237,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.2) inset',
          }}
        >
          Try again
        </motion.button>

        <p className="text-[12px] text-white/30 mt-6">
          This screen disappears automatically when you reconnect.
        </p>
      </div>
    </motion.div>
  );
}
