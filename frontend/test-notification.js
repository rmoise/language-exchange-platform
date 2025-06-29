// Test script to verify notification persistence
// Run this in the browser console to test

// Find the WebSocket manager
const ws = window.ws || window.globalWebSocketManager;

if (ws) {
  // Simulate receiving a new message
  const testMessage = {
    type: 'new_message',
    data: {
      id: 'test-msg-' + Date.now(),
      conversation_id: 'test-conv-123',
      sender_id: 'test-sender-456',
      sender: {
        name: 'Test User'
      },
      content: 'This is a test message to check notifications',
      created_at: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  // Trigger the message handlers
  if (ws.handleMessage) {
    console.log('Triggering test message:', testMessage);
    ws.handleMessage(testMessage);
  } else if (ws.onMessage) {
    console.log('Triggering test message via onMessage:', testMessage);
    ws.onMessage(testMessage);
  } else {
    console.log('WebSocket manager structure:', ws);
  }
} else {
  console.log('WebSocket manager not found. Looking for it...');
  // Try to find it in the React fiber tree
  const reactRoot = document.getElementById('__next');
  console.log('React root:', reactRoot);
}