import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4l12 6-12 6V4z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white tracking-wide">
              Prime<span className="text-violet-400">Vista</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className="text-gray-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Home
            </Link>
            {user && isAdmin && (
              <Link 
                to="/admin" 
                className="text-gray-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
