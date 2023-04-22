import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text: input, sender: 'user' },
    ]);
    setInput('');
  
    // Simulate streaming bot response
    streamBotResponse('This is an example of a streamed bot response.');
  };  
  
  const streamBotResponse = (response: string) => {
    const words = response.split(' ');
    let currentResponse = '';
  
    words.forEach((word, index) => {
      setTimeout(() => {
        currentResponse += `${word} `;
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
  
          if (lastMessage.sender === 'bot') {
            const updatedBotMessage = {
              ...lastMessage,
              text: currentResponse,
            };
            return [...prevMessages.slice(0, -1), updatedBotMessage];
          } else {
            return [...prevMessages, { id: Date.now(), text: currentResponse, sender: 'bot' }];
          }
        });
      }, 500 * index); // Adjust the delay as needed
    });
  };
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col flex-1 p-4 overflow-y-auto space-y-4 bg-opacity-80 bg-[rgba(238,221,198,0.8)] rounded-md">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 pl-4 pr-4 text-black break-words rounded-md ${
              message.sender === 'user'
                ? 'bg-[rgba(95,158,160,0.8)] self-end'
                : 'bg-[rgba(210,180,140,0.8)] self-start'
            }`}
          >
            {message.text}
          </div>
        ))}
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


