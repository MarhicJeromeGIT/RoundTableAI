import React, { useEffect, useState } from 'react';
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

  const socket = useSocket('http://localhost:3001');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text: input, type: 'user' },
    ]);
    setInput('');

    // Send as socket message
    sendMessage(input);

    // Simulate streaming bot response
    // streamBotResponse('This is an example of a streamed bot response, it`s quite long and exactly what you expected.');
  };  
  
  const streamBotResponse = (response: string) => {
    const words = response.split(' ');
    let currentResponse = '';
  
    words.forEach((word, index) => {
      setTimeout(() => {
        currentResponse += `${word} `;
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
  
          if (lastMessage.type === 'bot') {
            const updatedBotMessage = {
              ...lastMessage,
              text: currentResponse,
            };
            return [...prevMessages.slice(0, -1), updatedBotMessage];
          } else {
            return [...prevMessages, { id: Date.now(), text: currentResponse, type: 'bot' }];
          }
        });
      }, 500 * index); // Adjust the delay as needed
    });
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

    // Listen for incoming messages
    socket.on('message', (message: string) => {
      console.log("we got a message !")
      console.log(message)

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), text: message, type: 'bot', name: 'Olaf', description: 'angry' },
      ]);
    });

    return () => {
      socket.off('message');
    };
  }, [socket]);

  const sendMessage = (message: string) => {
    if (!socket) return;
    socket.emit('message', message);
  };

  return (
    <div className="flex flex-col h-5/6 bottom-0">
        <div className="flex flex-col h-full overflow-y-scroll p-4 space-y-4 bg-opacity-80 bg-[rgba(238,221,198,0.8)] rounded-md">
          {messages.map(renderMessage)}
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


