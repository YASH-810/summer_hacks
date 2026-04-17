export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <h1
          className="text-4xl font-bold text-text-primary mb-4"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          FocusOS
        </h1>
        <p className="text-text-secondary text-lg text-center max-w-md">
          Stop managing distractions. Start understanding them.
        </p>
      </main>
    </div>
  );
}
