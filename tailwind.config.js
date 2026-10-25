/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cabinet: {
          bg: "#12111A",
          crt: "#1C1A27",
          bezel: "#2D2A3E",
          border: "#3E3A54",
        },
        arcade: {
          red: "#FF3366",
          redLip: "#B3123B",
          amber: "#FFC700",
          amberLip: "#B88600",
          cyan: "#00F0FF",
          cyanLip: "#0099A8",
          green: "#00E676",
          greenLip: "#00994D",
          purple: "#B537F2",
          purpleLip: "#7314A3",
          ticket: "#FFF8E7",
          ink: "#12111A",
        }
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
        display: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'btn-red': '0 6px 0 #B3123B',
        'btn-red-pressed': '0 2px 0 #B3123B',
        'btn-amber': '0 6px 0 #B88600',
        'btn-amber-pressed': '0 2px 0 #B88600',
        'btn-cyan': '0 6px 0 #0099A8',
        'btn-cyan-pressed': '0 2px 0 #0099A8',
        'btn-green': '0 6px 0 #00994D',
        'btn-green-pressed': '0 2px 0 #00994D',
        'btn-purple': '0 6px 0 #7314A3',
        'btn-purple-pressed': '0 2px 0 #7314A3',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'glow-green': '0 0 15px rgba(0, 230, 118, 0.4)',
        'glow-amber': '0 0 15px rgba(255, 199, 0, 0.4)',
        'glow-purple': '0 0 15px rgba(181, 55, 242, 0.4)',
      }
    },
  },
  plugins: [],
}
