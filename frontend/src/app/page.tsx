export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white flex flex-col items-center justify-center">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-10 rounded-3xl shadow-xl text-center">
        <h1 className="text-4xl font-bold text-blue-400">Hemanth Portfolio Platform</h1>
        <p className="mt-4 text-lg text-gray-300">
          Full Stack Developer • ML Engineer • Cloud Enthusiast
        </p>
        <button className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition">
          View Projects
        </button>
      </div>
    </main>
  );
}