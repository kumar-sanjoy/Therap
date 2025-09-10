import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // React 18 configuration
      jsxRuntime: 'automatic',
    })
  ],
  server: {
    port: 3000,
    // Add health check endpoint to prevent 404 errors
    proxy: {
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health/, '')
      }
    }
  },
  resolve: {
    alias: {
      // Ensure proper resolution of @react-pdf/renderer
      '@react-pdf/renderer': '@react-pdf/renderer'
    }
  },
  define: {
    // Fix for @react-pdf/renderer compatibility
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // Routing
            if (id.includes('react-router-dom')) {
              return 'router-vendor';
            }
            
            // Material-UI - split by package
            if (id.includes('@mui/material')) {
              return 'mui-material-vendor';
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons-vendor';
            }
            
            // Emotion (CSS-in-JS)
            if (id.includes('@emotion')) {
              return 'emotion-vendor';
            }
            
            // PDF libraries
            if (id.includes('@react-pdf/renderer')) {
              return 'react-pdf-vendor';
            }
            if (id.includes('jspdf') || id.includes('pdfmake')) {
              return 'pdf-utils-vendor';
            }
            
            // Markdown processing
            if (id.includes('react-markdown')) {
              return 'react-markdown-vendor';
            }
            if (id.includes('remark') || id.includes('rehype')) {
              return 'markdown-processors-vendor';
            }
            
            // Icons
            if (id.includes('lucide-react')) {
              return 'lucide-vendor';
            }
            if (id.includes('react-icons')) {
              return 'react-icons-vendor';
            }
            
            // Authentication
            if (id.includes('@react-oauth/google')) {
              return 'google-auth-vendor';
            }
            if (id.includes('jwt-decode')) {
              return 'jwt-vendor';
            }
            
            // CSS processing
            if (id.includes('tailwindcss')) {
              return 'tailwind-vendor';
            }
            if (id.includes('autoprefixer') || id.includes('postcss')) {
              return 'postcss-vendor';
            }
            
            // Split remaining vendor into smaller chunks
            if (id.includes('node_modules')) {
              // Get the package name from the path
              const packageMatch = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
              if (packageMatch) {
                const packageName = packageMatch[1];
                // Group similar packages together
                if (packageName.startsWith('@types/')) {
                  return 'types-vendor';
                }
                if (packageName.includes('lodash') || packageName.includes('underscore')) {
                  return 'utils-vendor';
                }
                // Create chunks for remaining packages
                return `vendor-${packageName.replace(/[^a-zA-Z0-9]/g, '-')}`;
              }
            }
            
            return 'vendor-misc';
          }
          
          // Feature-based chunks for your components
          if (id.includes('src/components/Login/')) {
            return 'auth';
          }
          if (id.includes('src/components/Intro/')) {
            return 'intro';
          }
          if (id.includes('src/components/MainPage/')) {
            return 'main-app';
          }
          if (id.includes('src/components/Quiz/') || id.includes('src/components/Learn/')) {
            return 'quiz-features';
          }
          if (id.includes('src/components/Notes/')) {
            return 'notes-features';
          }
          if (id.includes('src/components/Teacher/')) {
            return 'teacher-features';
          }
          if (id.includes('src/components/Forms/')) {
            return 'forms-features';
          }
          if (id.includes('src/components/Common/')) {
            return 'common-features';
          }
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Asset optimization
    assetsInlineLimit: 4096 // Inline assets smaller than 4KB
  },
  // Optimize dependencies for React 18
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['jspdf', 'pdfmake']
  },
  // Additional optimizations
  esbuild: {
    drop: ['console', 'debugger']
  }
})