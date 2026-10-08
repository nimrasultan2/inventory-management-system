import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
      <p className="text-gray-500">You don&apos;t have permission to view this page.</p>
      <Link to="/login" className="text-sm text-violet-600 hover:underline">
        Back to login
      </Link>
    </div>
  );
}
