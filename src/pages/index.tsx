import Image from 'next/image'
import { Inter } from 'next/font/google'
import ChatbotPage from './ChatbotPage';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 text-white bg-cover"
      style={{
        backgroundImage: 'url("/nik-shuliahin-JOzv_pAkcMk-unsplash.jpg")',
      }}
    >
      <div className="w-full max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold underline text-[Cinzel]">
          Round Table AI
        </h1>
        <ChatbotPage />
      </div>
    </div>
  );
}
