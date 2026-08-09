/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        buzz: {
          bg: '#05050A',       // Deepest dark
          surface: '#0A0A12',  // Slightly lighter
          card: '#10101C',     // Card background
          border: '#1E1E32',   // Refined borders
          yellow: '#FFD700',   // Vibrant golden yellow
          'yellow-dark': '#E5C100',
          red: '#FF3B30',      // Vibrant iOS-style red
          'red-dark': '#CC2F26',
          'red-glow': '#FF6B6B',
          green: '#34C759',    // Vibrant green
          blue: '#007AFF',     // Vibrant blue
          purple: '#AF52DE',   // Vibrant purple
          muted: '#8E8E93',
          text: '#F2F2F7',
          'text-dim': '#AEAEC0',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.2, 0, 0.8, 1) infinite',
        'pulse-ring-fast': 'pulse-ring 1.5s cubic-bezier(0.2, 0, 0.8, 1) infinite',
        'buzz-shake': 'buzz-shake 0.4s ease-in-out',
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slow-reverse': 'spin 12s linear infinite reverse',
        'bounce-subtle': 'bounce-subtle 3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { opacity: '0.8', transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
          '100%': { opacity: '0', transform: 'scale(1.5)', boxShadow: '0 0 0 30px rgba(255, 215, 0, 0)' },
        },
        'buzz-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%, 45%, 75%': { transform: 'translateX(-6px)' },
          '30%, 60%': { transform: 'translateX(6px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'glow': {
          from: { boxShadow: '0 0 20px rgba(255, 59, 48, 0.4)' },
          to: { boxShadow: '0 0 40px rgba(255, 59, 48, 0.8), 0 0 80px rgba(255, 59, 48, 0.3)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '24px',
      },
      boxShadow: {
        'glow-yellow': '0 0 30px rgba(255, 215, 0, 0.5)',
        'glow-red': '0 0 40px rgba(255, 59, 48, 0.6)',
        'glow-green': '0 0 30px rgba(52, 199, 89, 0.5)',
        'glass': '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 16px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'buzzer-idle': '0 20px 50px rgba(255, 215, 0, 0.4), inset 0 -10px 20px rgba(0, 0, 0, 0.3), inset 0 4px 10px rgba(255, 255, 255, 0.5)',
        'buzzer-pressed': '0 5px 15px rgba(255, 215, 0, 0.3), inset 0 10px 20px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.2)',
        'buzzer-locked': '0 10px 30px rgba(255, 59, 48, 0.2), inset 0 -10px 20px rgba(0, 0, 0, 0.3), inset 0 4px 10px rgba(255, 255, 255, 0.2)',
        'buzzer-locked-pressed': '0 2px 10px rgba(255, 59, 48, 0.1), inset 0 10px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
