import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import Home from './Home';
import Dashboard from './Dashboard';
import ScanTree from './ScanTree';
import Marketplace from './Marketplace';
import MyOrders from './MyOrders';
import AdminPanel from './AdminPanel';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading, loadProfile, checkRole } = useProfile(user?.id);
  const { showNotification } = useAuthContext();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      checkRole('admin').then(setIsAdmin);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
    showNotification('Logged out successfully');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {user && profile && (
        <Navbar 
          user={profile} 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
          onLogout={handleLogout} 
          isAdmin={isAdmin}
        />
      )}
      
      <main className={user ? "max-w-7xl mx-auto px-4 py-8" : ""}>
        {!user && <Home onNavigate={() => navigate('/auth')} />}
        {user && profile && currentPage === 'dashboard' && <Dashboard user={profile} showNotification={showNotification} />}
        {user && profile && currentPage === 'scan' && <ScanTree showNotification={showNotification} onComplete={() => { loadProfile(); setCurrentPage('dashboard'); }} />}
        {user && profile && currentPage === 'marketplace' && <Marketplace user={profile} showNotification={showNotification} onPurchase={loadProfile} />}
        {user && profile && currentPage === 'orders' && <MyOrders showNotification={showNotification} />}
        {user && profile && isAdmin && currentPage === 'admin' && <AdminPanel showNotification={showNotification} />}
      </main>
    </div>
  );
}
