import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminRoute from './components/Layout/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import GameLobby from './pages/Games/GameLobby';
import GameRoom from './pages/Games/GameRoom';
import Wallet from './pages/Wallet/Wallet';
import Deposit from './pages/Wallet/Deposit';
import Withdraw from './pages/Wallet/Withdraw';
import Transactions from './pages/Wallet/Transactions';
import Profile from './pages/Profile/Profile';
import Leaderboard from './pages/Leaderboard';
import Referrals from './pages/Referrals';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminTransactions from './pages/Admin/AdminTransactions';
import AdminGames from './pages/Admin/AdminGames';

// Error Pages
import NotFound from './pages/NotFound';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/games"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <GameLobby />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/game/:roomId"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <GameRoom />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Wallet />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wallet/deposit"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Deposit />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wallet/withdraw"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Withdraw />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/wallet/transactions"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Transactions />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/referrals"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Referrals />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </AdminRoute>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <Layout>
                        <AdminUsers />
                      </Layout>
                    </AdminRoute>
                  }
                />

                <Route
                  path="/admin/transactions"
                  element={
                    <AdminRoute>
                      <Layout>
                        <AdminTransactions />
                      </Layout>
                    </AdminRoute>
                  }
                />

                <Route
                  path="/admin/games"
                  element={
                    <AdminRoute>
                      <Layout>
                        <AdminGames />
                      </Layout>
                    </AdminRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4aed88',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ff4b4b',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;