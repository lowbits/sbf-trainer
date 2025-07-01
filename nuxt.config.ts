// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    future: {
        compatibilityVersion: 4,
    },
    devtools: {enabled: true,},
    modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],
    tailwindcss: {
        theme: {
            extend: {
                colors: {
                    ocean: {
                        50: '#f0f9ff',
                        100: '#e0f2fe',
                        200: '#bae6fd',
                        300: '#7dd3fc',
                        400: '#38bdf8',
                        500: '#0ea5e9',
                        600: '#0284c7',
                        700: '#0369a1',
                        800: '#075985',
                        900: '#0c4a6e',
                    }
                },
                animation: {
                    'fade-in': 'fadeIn 0.5s ease-in-out',
                    'slide-up': 'slideUp 0.4s ease-out',
                    'float': 'float 6s ease-in-out infinite',
                    'glow': 'glow 2s ease-in-out infinite alternate',
                },
                keyframes: {
                    fadeIn: {
                        '0%': {opacity: '0', transform: 'translateY(10px)'},
                        '100%': {opacity: '1', transform: 'translateY(0)'}
                    },
                    slideUp: {
                        '0%': {opacity: '0', transform: 'translateY(20px)'},
                        '100%': {opacity: '1', transform: 'translateY(0)'}
                    },
                    float: {
                        '0%, 100%': {transform: 'translateY(0px)'},
                        '50%': {transform: 'translateY(-10px)'}
                    },
                    glow: {
                        '0%': {boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)'},
                        '100%': {boxShadow: '0 0 30px rgba(14, 165, 233, 0.6)'}
                    }
                }
            }
        }
    }
})