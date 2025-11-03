const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const clients = new Map();

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        try {
            const url = new URL(req.url, 'ws://localhost');
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(1008, 'No token provided');
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            ws.userId = userId;
            ws.isAlive = true;

            clients.set(userId, ws);

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log('Received:', data);
                } catch (e) {
                    console.error('Invalid message format');
                }
            });

            ws.on('close', () => {
                clients.delete(userId);
                ws.isAlive = false;
            });

        } catch (error) {
            ws.close(1008, 'Invalid token');
        }
    });

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

const sendMessageToUser = (userId, message) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
};

module.exports = { setupWebSocket, sendMessageToUser };