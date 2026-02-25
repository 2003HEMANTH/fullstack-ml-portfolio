export default function AdminPage() {
    return (
      <div className="min-h-screen bg-black text-white p-10">
        <h1 className="text-4xl font-bold text-red-500">Admin Dashboard</h1>
        <p className="mt-4 text-gray-400">Protected route (JWT + Google OAuth).</p>
      </div>
    );
  }