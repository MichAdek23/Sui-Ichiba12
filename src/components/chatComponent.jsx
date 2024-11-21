import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { sendMessage, getMessages } from '../services/chat'; // Import the chat functions

const ChatComponent = ({ buyerId, sellerId }) => {
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the chat messages in real-time
    const fetchMessages = async () => {
      getMessages(buyerId, sellerId, (messages) => {
        setMessages(messages);
      });
    };

    fetchMessages();
  }, [buyerId, sellerId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(currentUserId, currentUserId === buyerId ? sellerId : buyerId, message);
      setMessage('');  // Clear input field after sending
    }
  };

  return (
    <div>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            <strong>{msg.senderId === buyerId ? 'Buyer' : 'Seller'}: </strong>
            <span>{msg.message}</span>
            <div style={{ fontSize: '0.8rem', color: '#777' }}>
              {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '100%', padding: '10px', marginTop: '10px' }}
      ></textarea>
      <button onClick={handleSendMessage} style={{ marginTop: '10px' }}>
        Send
      </button>
    </div>
  );
};

export default ChatComponent;
