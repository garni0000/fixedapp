import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
              FixedMatch
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link to="/fixed" className="hover:text-primary transition-colors">
                  Fixed
                </Link>
                <Link to="/history" className="hover:text-primary transition-colors">
                  Historique
                </Link>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  Profile
                </Link>
                <Link to="/payment" className="hover:text-primary transition-colors">
                  Abonnement
                </Link>
                {user.isVIP && (
                  <span className="vip-badge px-3 py-1 rounded-full text-xs">
                    VIP
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
            {!user && (
              <Button onClick={() => navigate('/auth')} className="neon-border">
                Connexion
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4">
            {user && (
              <>
                <Link
                  to="/fixed"
                  className="block hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fixed
                </Link>
                <Link
                  to="/history"
                  className="block hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Historique
                </Link>
                <Link
                  to="/profile"
                  className="block hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/payment"
                  className="block hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Abonnement
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
