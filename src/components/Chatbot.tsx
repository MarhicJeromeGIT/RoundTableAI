import React, { useEffect, useState, useRef } from 'react';
import useSocket from '../hooks/useSocket';

interface Message {
  id: number;
  text: string;
  type: 'user' | 'bot' | 'narrator';
  name?: string;
  description?: string;
}

const Chatbot: React.FC = () => {
  const narratorText = `The sun begins to set, casting a warm glow on the quaint village of Eldershire.
  A refreshing breeze rustles through the trees, carrying with it the sweet scent of blooming flowers.
  In the heart of the village, a bustling marketplace hums with life as merchants peddle their wares and villagers chatter amongst themselves.
  Our hero, a fledgling adventurer with dreams of grandeur, enters the scene, eager to embark on their first great quest.`;

  const npcText = `Well met, traveler! The name's Olaf. You look like a newcomer to these parts.
  Tell me, what brings you to our humble village of Eldershire?`
  
  const initialMessages: Message[] = [
    { id: 1, type: 'narrator', text: narratorText },
    { id: 2, type: 'bot', text: npcText, name: 'Olaf', description: 'grizzled blacksmith, wiping sweat from his brow' },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastReceivedWord, setLastReceivedWord] = useState('');
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

  const getMessageClass = (type: 'user' | 'bot' | 'narrator') => {
    let bgColor;

    switch (type) {
      case 'user':
        bgColor = 'bg-[rgba(95,158,160,0.8)] self-end';
        break;
      case 'bot':
        bgColor = 'bg-[rgba(210,180,140,0.8)] self-start';
        break;
      case 'narrator':
        bgColor = 'bg-[rgba(255,215,0,0.8)] self-center'; // Choose a different background color for the narrator
        break;
      default:
        bgColor = '';
    }

    return `p-2 pl-4 pr-4 flex-none text-black break-words rounded-md overflow-x-scroll ${bgColor}`;
  };

  function renderBotInfo(message: Message) {
    if (message.type === 'bot') {
      return (
        <>
        {message.name && <strong>{message.name}</strong>}
        {message.description && (
          <span className="italic">({message.description})</span>
        )}
        </>
      );
    }
    return null;
  }

  function renderMessage(message: Message) {
    return (
      <div key={message.id} className={getMessageClass(message.type)}>
        <div>{renderBotInfo(message)}</div>
        <div>{message.text}</div>
      </div>
    );
  }
  
  useEffect(() => {
    console.log("use effect for socket")
    if (!socket) return;

    console.log("socket exists")

    // Handle successful connection
    socket.on('connect', () => {
      setConnectionError(null);
    });
    
    // Listen for incoming messages
    // socket.on('message', (message: string) => {
    //   console.log("we got a message !")
    //   console.log(message)

    //   setMessages((prevMessages) => [
    //     ...prevMessages,
    //     { id: Date.now(), text: message, type: 'bot', name: 'Olaf', description: 'angry' },
    //   ]);
    // });

    socket.on('new_word', (data) => {
      const word: string = data.word;
      console.log("received word " + word)
      setLastReceivedWord(word);
    });

    // // Event listener for new words
    // socket.on('new_word', (data) => {
    //   console.log("messages so far")
    //   console.log(messages)
    //   console.log("received word " + data.word)
    //   const word: string = data.word;
      
    //   // Check if the last message is of type 'bot'
    //   setMessages((prevMessages) => {
    //     // Check if the last message is of type 'bot'
    //     const lastMessage = prevMessages[prevMessages.length - 1];
    //     if (lastMessage && lastMessage.type === 'bot') {
    //       // Update the last message's text
    //       lastMessage.text += ' ' + word;
    //       return [...prevMessages.slice(0, -1), lastMessage];
    //     } else {
    //       // Create a new message object and add it to the messages array
    //       const newMessage = {
    //         id: Date.now(),
    //         text: word,
    //         type: 'bot' as 'bot', // Ensure that the type is 'bot' and compatible with the Message interface
    //         name: 'Bot',
    //       };
    //       return [...prevMessages, newMessage];
    //     }
    //   });
    // });

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
    if (!lastReceivedWord) {
      return;
    }
  
    setMessages((prevMessages) => {
      // Check if the last message is of type 'bot'
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage && lastMessage.type === 'bot') {
        // Update the last message's text without mutating the previous state
        const updatedLastMessage = {
          ...lastMessage,
          text: lastReceivedWord,
        };
        return [...prevMessages.slice(0, -1), updatedLastMessage];
      } else {
        // Create a new message object and add it to the messages array
        const newMessage = {
          id: Date.now(),
          text: lastReceivedWord,
          type: 'bot' as 'bot', // Ensure that the type is 'bot' and compatible with the Message interface
          name: 'Bot',
        };
        return [...prevMessages, newMessage];
      }
    });
  
  }, [lastReceivedWord]);

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
          {messages.map(renderMessage)}

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


