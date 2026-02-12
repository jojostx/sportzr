import { WebSocketServer } from 'ws';

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

function broadcastJson(wss, payload) {
    wss.clients.forEach((client) => {
        if (client.readyState !== WebSocket.OPEN) return;

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

        sendJson(ws, { type: 'welcome', message: 'Welcome to the Sportzr WebSocket server!' });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    function broadcastMatchCreated(match) {
        broadcastJson(wss, { type: 'match_created', data: match });
    }

    return {
        wss,
        broadcastMatchCreated
    };
}