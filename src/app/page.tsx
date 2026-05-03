import { SearchForm } from '@/components/search/search-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 pt-12 pb-24 sm:pt-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Find truck parking, fast.
        </h1>
        <p className="mt-3 text-base text-neutral-700">
          Type your exit and state. See open truck stops with real-time
          pricing and availability.
        </p>

        <div className="mt-8">
          <SearchForm />
        </div>
      </div>
    </main>
  );
}
