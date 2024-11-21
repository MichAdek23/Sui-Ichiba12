import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase'; // Assuming you've already set up Firebase Firestore and Auth
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';

const ProductMessage = ({ productId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Fetch messages related to this specific product from Firestore in real-time
  useEffect(() => {
    const messagesRef = collection(db, 'productMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArray = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().productId === productId) {
          messagesArray.push(doc.data());
        }
      });
      setMessages(messagesArray);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await addDoc(collection(db, 'productMessages'), {
          text: message,
          user: user.email,
          timestamp: new Date(),
          productId: productId,
        });
        setMessage('');
      } catch (error) {
        console.error('Error sending message: ', error);
      }
    }
  };

  return (
    <ProductMessageContainer>
      <MessageContainer>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <Message key={index}>
              <MessageUser>{msg.user}</MessageUser>
              <MessageText>{msg.text}</MessageText>
            </Message>
          ))
        ) : (
          <NoMessages>No messages yet...</NoMessages>
        )}
      </MessageContainer>

      {user ? (
        <InputContainer>
          <TextInput
            type="text"
            placeholder="Leave a message or review..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <SendButton onClick={handleSendMessage}>Send</SendButton>
        </InputContainer>
      ) : (
        <SignInPrompt>Please sign in to leave a message or review.</SignInPrompt>
      )}
    </ProductMessageContainer>
  );
};

export default ProductMessage;

// Styled Components

const ProductMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const MessageContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MessageUser = styled.span`
  font-weight: bold;
  color: #007bff;
`;

const MessageText = styled.span`
  margin-top: 5px;
  font-size: 16px;
  color: #333;
`;

const NoMessages = styled.p`
  font-size: 18px;
  color: #999;
  text-align: center;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TextInput = styled.input`
  width: 80%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SendButton = styled.button`
  width: 18%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SignInPrompt = styled.p`
  font-size: 16px;
  color: #555;
  text-align: center;
  margin-top: 20px;
`;

