import { WebSocketServer, WebSocket } from 'ws';

// Helper: Safely send JSON
function sendJson(socket, payload) {
    // 1. Guard clause handles the check efficiently
    if (socket.readyState !== WebSocket.OPEN) return;

    try {
        socket.send(JSON.stringify(payload));
    } catch (e) {
        console.error('Failed to serialize/send JSON:', e);
    }
}

// Helper: Broadcast to all
function broadcastJson(wss, payload) {
    wss.clients.forEach((client) => {
        // 2. Removed redundant readyState check here; sendJson handles it.
        sendJson(client, payload);
    });
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 10 * 1024 * 1024
    });

    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        // Error handling is crucial per socket
        ws.on('error', (error) => {
            console.error('WebSocket client error:', error);
        });

        sendJson(ws, { type: 'welcome', message: 'Welcome to the Sportzr WebSocket server!' });
    });

    // 3. Heartbeat Logic
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    // 4. CLEANUP: Stop the interval if the server closes
    wss.on('close', () => {
        clearInterval(interval);
    });

    function broadcastMatchCreated(match) {
        broadcastJson(wss, { type: 'match_created', data: match });
    }

    return {
        wss,
        broadcastMatchCreated
    };
}