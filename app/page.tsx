export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center mb-8">
          Fortnite.gg Map Stats
        </h1>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-xl text-center">
            Welcome to your Fortnite Map Stats tracker! 
            More features coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}
