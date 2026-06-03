import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900:'#14110F',850:'#1A1614',800:'#211C19',750:'#2A2420',700:'#342D28',line:'#3A322C' },
        washi: { 50:'#F5EFE4',200:'#D8CDBA',400:'#A8987F',600:'#6E6353' },
        shu: { 400:'#F26A4F',500:'#E8482B',600:'#C93C22' },
        ai:'#4A6FA5', matcha:'#7E9B5A', kin:'#C9A227', sumi:'#8A7F73',
      },
      fontFamily: {
        display:['Zodiak','Georgia','serif'],
        jp:['"Shippori Mincho"','serif'],
        body:['Satoshi','ui-sans-serif','sans-serif'],
        mono:['"Spline Sans Mono"','ui-monospace','monospace'],
      },
      borderRadius:{ sm:'4px', md:'8px', lg:'12px' },
      maxWidth:{ content:'1240px' },
      spacing:{ rail:'264px' },
      boxShadow:{ e1:'0 1px 0 rgba(0,0,0,0.4)', e2:'0 8px 24px -12px rgba(0,0,0,0.6)' },
      transitionTimingFunction:{ out:'cubic-bezier(0.22,1,0.36,1)', smooth:'cubic-bezier(0.65,0,0.35,1)' },
      keyframes:{ 'fade-up':{ '0%':{opacity:'0',transform:'translateY(8px)'},'100%':{opacity:'1',transform:'translateY(0)'} } },
      animation:{ 'fade-up':'fade-up 240ms cubic-bezier(0.22,1,0.36,1) both' },
    },
  },
  plugins: [],
};

export default config;
