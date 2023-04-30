import React from 'react';
import styled from 'styled-components';
import Avatar from './Avatar';
import { Message } from '../types/message';

interface ChatMessageProps {
  message: Message;
  avatarUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';
  const avatarUrl = isBot ? 'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl90fjxwk232526vmqy2m4ukjgs/public' : undefined;
  const messageBgColor = isBot ? 'bg-gray-200' : 'bg-blue-500';
  const messageTextColor = isBot ? 'text-black' : 'text-white';

  const messageBgClass = (type: 'user' | 'bot' | 'narrator') => {
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
  }

  return (
    <div className={`flex items-start mb-2 ${messageBgClass(message.type)}`}>
      <div
        className={`rounded-lg px-3 py-2 ${messageTextColor}`}
      >
        {isBot && avatarUrl && <Avatar src={avatarUrl} />}
        <div>{message.text}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
