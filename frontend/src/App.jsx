import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import VideoPlayerPage from './pages/VideoPlayerPage';

const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="relative">
      <div className="w-12 h-12 border-2 border-gray-800 rounded-full"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-2 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userRole, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/video/:id" element={
          <ProtectedRoute>
            <VideoPlayerPage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
