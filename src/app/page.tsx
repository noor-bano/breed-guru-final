import { TestTube2 } from 'lucide-react';
import BreedGuruClient from '@/components/breed-guru-client';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <TestTube2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground font-headline">
            Breed Guru
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-10">
        <div className="w-full max-w-4xl">
          <BreedGuruClient />
        </div>
      </main>
    </div>
  );
}
