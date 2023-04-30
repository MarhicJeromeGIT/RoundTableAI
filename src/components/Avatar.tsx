import React from 'react';

interface AvatarProps {
  src: string;
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt || 'User avatar'}
      className="avatar" // Add a CSS class for styling
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '10px',
      }}
    />
  );
};

export default Avatar;
