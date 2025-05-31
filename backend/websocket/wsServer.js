const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        try {
            // Extract token from URL query parameters
            const url = new URL(req.url, 'ws://localhost');
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(1008, 'No token provided');
                return;
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            ws.userId = decoded.id;
            ws.isAlive = true;

            // Handle ping-pong to keep connection alive
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // Handle client messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    // Handle different message types if needed
                    console.log('Received:', data);
                } catch (e) {
                    console.error('Invalid message format');
                }
            });

            // Handle client disconnect
            ws.on('close', () => {
                ws.isAlive = false;
            });

        } catch (error) {
            ws.close(1008, 'Invalid token');
        }
    });

    // Ping all clients every 30 seconds to keep connections alive
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    return wss;
};

module.exports = setupWebSocket; 