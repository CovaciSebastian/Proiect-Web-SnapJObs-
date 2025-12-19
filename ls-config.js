const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Define the proxy middleware.
 * This will intercept any requests starting with /api and forward them to the backend.
 */
const apiProxy = createProxyMiddleware('/api', {
    target: 'http://localhost:3000', // The backend server
    changeOrigin: true,              // Recommended for virtual hosted sites
    logLevel: 'debug'                // To see proxy actions in the console
});

/**
 * Live-server configuration.
 */
module.exports = {
    port: 8080,         // The port for the frontend server
    root: './',         // Serve files from the root of the project
    open: 'index.html', // Automatically open this file
    file: 'index.html', // Fallback for root requests
    middleware: [apiProxy] // Use the proxy middleware
};
