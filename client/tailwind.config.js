/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,jsx}",
	  "./components/**/*.{js,jsx}",
	  "./app/**/*.{js,jsx}",
	  "./src/**/*.{js,jsx}",
	  "*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
			fontFamily:{
				marcellus:['Tenor Sans']

			},
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: "#114639",
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
				customGreen:'#114639',
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: 0
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: 0
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
  }


// /** @type {import('tailwindcss').Config} */
// module.exports = {
// 	darkMode: ["class"],
// 	content: [
// 	  "./pages/**/*.{js,ts,jsx,tsx}",
// 	  "./components/**/*.{js,ts,jsx,tsx}",
// 	  "./app/**/*.{js,ts,jsx,tsx}",
// 	  "./src/**/*.{js,ts,jsx,tsx}",
// 	  "*.{js,ts,jsx,tsx,mdx}",
// 	],
// 	prefix: "",
// 	theme: {
//     	container: {
//     		center: true,
//     		padding: '2rem',
//     		screens: {
//     			'2xl': '1400px'
//     		}
//     	},
//     	extend: {
// 			fontFamily: {
// 				marcellus: ['Tenor Sans', 'sans-serif'],
// 				poppins: ['Poppins', 'sans-serif'],
// 				playfair: ['Playfair Display', 'serif']
// 			},
//     		colors: {
//     			border: 'hsl(var(--border))',
//     			input: 'hsl(var(--input))',
//     			ring: 'hsl(var(--ring))',
//     			background: 'hsl(var(--background))',
//     			foreground: 'hsl(var(--foreground))',
// 				coffee: {
// 					light: '#E8D9C5',
// 					medium: '#C8B6A6',
// 					dark: '#8D7B68',
// 					darkest: '#4C3D30',
// 					emerald: '#114639',
// 				},
// 				customGreen: '#114639',
//     			primary: {
//     				DEFAULT: 'hsl(var(--primary))',
//     				foreground: 'hsl(var(--primary-foreground))'
//     			},
//     			secondary: {
//     				DEFAULT: 'hsl(var(--secondary))',
//     				foreground: 'hsl(var(--secondary-foreground))'
//     			},
//     		},
//     		borderRadius: {
//     			lg: 'var(--radius)',
//     			md: 'calc(var(--radius) - 2px)',
//     			sm: 'calc(var(--radius) - 4px)'
//     		},
//     		keyframes: {
//     			'accordion-down': {
//     				from: { height: 0 },
//     				to: { height: 'var(--radix-accordion-content-height)' }
//     			},
//     			'accordion-up': {
//     				from: { height: 'var(--radix-accordion-content-height)' },
//     				to: { height: 0 }
//     			},
// 				'steam': {
// 					'0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
// 					'50%': { opacity: '0.5' },
// 					'100%': { transform: 'translateY(-20px) translateX(-5px) scale(1.5)', opacity: '0' }
// 				},
// 				'fill-cup': {
// 					'0%': { height: '0%', opacity: '0.2' },
// 					'50%': { opacity: '0.4' },
// 					'100%': { height: '70%', opacity: '0.8' }
// 				},
//     		},
//     		animation: {
//     			'accordion-down': 'accordion-down 0.2s ease-out',
//     			'accordion-up': 'accordion-up 0.2s ease-out',
// 				'steam-1': 'steam 2s ease-out infinite',
// 				'fill-cup': 'fill-cup 2s ease-in-out infinite alternate'
//     		}
//     	}
//     },
// 	plugins: [require("tailwindcss-animate")],
// };
