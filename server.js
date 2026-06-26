const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env or .env.local
const envPaths = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env')
];

let envVars = {};
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        envVars[key] = val.trim();
      }
    });
    break; // Load first found
  }
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || envVars.OPENROUTER_API_KEY || '';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Echo Voice Assistant WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to Echo Voice Assistant');

  // Keep track of conversation history in session
  const chatHistory = [
    {
      role: 'system',
      content: 'You are Nora, a caring, helpful, and friendly AI platform guide for the Echo digital sanctuary app. Your main goal is to teach users how they can use the Echo platform to find someone, make friends, chat in real-time, customize AI companions, and synchronise their moods. Keep your answers extremely concise (1-2 sentences), conversational, warm, and natural. Since the user will hear your response spoken aloud, avoid bullet points, markdown formatting, or emojis in your text.'
    }
  ];

  // Send automatic introduction on connection
  const introText = "Hi, I'm Nora. Ask me how to find someone, make friends, or navigate the sanctuary!";
  chatHistory.push({ role: 'assistant', content: introText });
  setTimeout(() => {
    ws.send(JSON.stringify({ type: 'done', text: introText }));
  }, 600);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (data.type === 'user-message') {
        const userText = data.text;
        console.log(`Received: ${userText}`);

        chatHistory.push({ role: 'user', content: userText });

        ws.send(JSON.stringify({ type: 'status', status: 'thinking' }));

        const apiKey = OPENROUTER_API_KEY;
        if (!apiKey) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'OpenRouter API key is missing on the server. Please check your environment variables.'
          }));
          ws.send(JSON.stringify({ type: 'status', status: 'idle' }));
          return;
        }

        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemma-4-31b-it:free',
              messages: chatHistory,
              stream: true,
              temperature: 0.7,
              max_tokens: 150,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
          }

          if (!response.body) {
            throw new Error('Response body is not readable');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let completeText = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const cleanLine = line.trim();
              if (!cleanLine || cleanLine === 'data: [DONE]') continue;

              if (cleanLine.startsWith('data: ')) {
                try {
                  const json = JSON.parse(cleanLine.slice(6));
                  const delta = json.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    completeText += delta;
                    ws.send(JSON.stringify({ type: 'delta', text: delta }));
                  }
                } catch (e) {
                  // Ignore parsing errors for partial lines
                }
              }
            }
          }

          // Process remaining buffer if any
          if (buffer) {
            const cleanLine = buffer.trim();
            if (cleanLine && cleanLine.startsWith('data: ') && cleanLine !== 'data: [DONE]') {
              try {
                const json = JSON.parse(cleanLine.slice(6));
                const delta = json.choices?.[0]?.delta?.content || '';
                if (delta) {
                  completeText += delta;
                  ws.send(JSON.stringify({ type: 'delta', text: delta }));
                }
              } catch (e) { }
            }
          }

          chatHistory.push({ role: 'assistant', content: completeText });
          ws.send(JSON.stringify({ type: 'done', text: completeText }));
          console.log(`Replied: ${completeText}`);

        } catch (error) {
          console.error('OpenRouter query failed:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: `Failed to fetch response: ${error.message}`
          }));
        }
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Voice assistant WS server running on http://localhost:${PORT}`);
});
