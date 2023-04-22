import Image from 'next/image'
import { Inter } from 'next/font/google'
import Chatbot from '../components/Chatbot';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen h-screen p-4 text-white bg-cover"
      style={{
        backgroundImage: 'url("/nik-shuliahin-JOzv_pAkcMk-unsplash.jpg")',
      }}
    >
      {/* this is a comment  */}

      <div className='h-full w-full'>
        <h1 className="flex flex-auto mb-8 justify-center text-3xl font-bold underline text-[Cinzel]">
          Round Table AI
        </h1>
        <Chatbot />
      </div>
    </div>
  );
}
