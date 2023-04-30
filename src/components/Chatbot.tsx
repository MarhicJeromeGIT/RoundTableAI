import React, { useEffect, useState, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import Avatar from './Avatar';
import { Message } from '../types/message';
import ChatMessage from './ChatMessage';

const Chatbot: React.FC = () => {
  
  const initialMessages: Message[] = [];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastReceivedMessage, setLastReceivedMessage] = useState<Message>();
  const messageListRef = useRef<HTMLDivElement>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'NEXT_PUBLIC_SOCKET_URL not set';
  const socket = useSocket(socketUrl);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text: input, type: 'user' },
    ]);
    setInput('');

    // Send as socket message
    sendMessage(input);
  };
  
  useEffect(() => {
    console.log("use effect for socket")
    if (!socket) return;

    console.log("socket exists")

    // Handle successful connection
    socket.on('connect', () => {
      setConnectionError(null);
    });

    socket.on('new_message', (message: Message) => {
      console.log("received message ")
      console.log(message)
      setLastReceivedMessage(message);
    });

    // Handle connection error
    socket.on('connect_error', (error: Error) => {
      console.log(`Connection error: ${error.message}`);
      setConnectionError(`Connection error: ${error.message}`);
    });

    // Handle connection timeout
    socket.on('connect_timeout', () => {
      setConnectionError('Connection timeout');
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server
        setConnectionError('Disconnected by server');
      } else {
        // The disconnection was initiated by the client
        setConnectionError(`Disconnected: ${reason}`);
      }
    });

    return () => {
      socket.off('message');
      socket.off('connect_error');
      socket.off('connect_timeout');
      socket.off('disconnect');
    };
  }, [socket]);

  useEffect(() => {
    if (!lastReceivedMessage) {
      return;
    }
  
    setMessages((prevMessages) => {
      // Check if the last message is of type 'bot'
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage && lastMessage['id'] == lastReceivedMessage.id) {
        return [...prevMessages.slice(0, -1), lastReceivedMessage];
      } else {
        return [...prevMessages, lastReceivedMessage];
      }
    });
  
  }, [lastReceivedMessage]);

  const sendMessage = (message: string) => {
    if (!socket) return;
    socket.emit('message', message);
  };

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-5/6 bottom-0">
        <div
          ref={messageListRef}
          className="flex flex-col h-full overflow-y-scroll p-4 space-y-4 bg-opacity-80 bg-[rgba(238,221,198,0.8)] rounded-md"
        >
          {messages.map((message) => <ChatMessage key={message.id} message={message} />)}

          { connectionError ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{connectionError}</p>
            </div>
           ) : null
          }
        </div>
        <div className="flex items-center p-4 space-x-4 bg-opacity-60 bg-[rgba(64,38,33,0.8)] border-t-2 border-[rgba(64,38,33,0.8)]">
          <input
            className="flex-1 p-2 text-lg text-black border-2 border-gray-400 rounded-md focus:outline-none focus:border-[rgba(95,158,160,0.8)]"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="px-4 py-2 text-lg font-semibold text-white bg-[rgba(95,158,160,0.8)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(95,158,160,0.5)]"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
    </div>
  );
};

export default Chatbot;


