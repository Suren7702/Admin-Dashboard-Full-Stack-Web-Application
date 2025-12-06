// src/pages/NotFound.jsx
// src/pages/NotFound.jsx

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-6">Page Not Found</p>
        <a
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
