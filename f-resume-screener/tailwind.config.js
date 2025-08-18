/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'hsl(262 83% 58%)',
                'primary-glow': 'hsl(262 83% 68%)',
                accent: {
                    pink: 'hsl(326 72% 53%)',
                    blue: 'hsl(217 91% 60%)',
                    emerald: 'hsl(167 72% 40%)',
                },
                background: 'hsl(240 10% 98%)',
            },
            boxShadow: {
                elegant: '0 10px 30px -10px hsl(262 83% 58% / 0.2)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, hsl(262 83% 58%), hsl(292 76% 62%))',
                'gradient-hero': 'linear-gradient(135deg, hsl(262 83% 58%), hsl(292 76% 62%), hsl(322 69% 66%))',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-out forwards',
                float: 'float 3s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
