import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIOClient = io(url);
    setSocket(socketIOClient);

    return () => {
      console.log("disconnecting...")
      socketIOClient.disconnect();
    };
  }, [url]); // Empty array means the effect will run only once (on mount)

  return socket;
};

export default useSocket;
