export default function LegacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] to-[#16213e] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Legacy Version</h1>
        <p className="text-gray-300 mb-8">The legacy static version has been replaced with this new platform.</p>
        <a href="/" className="text-primary hover:underline">Go to new version →</a>
      </div>
    </div>
  );
}
