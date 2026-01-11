import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { FileText, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  if (!user) {
    return null;
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <FileText className="size-6 text-blue-600" />
              <span className="font-semibold">DocAI</span>
            </Link>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant={isActive('/') ? 'default' : 'ghost'}>
                  Home
                </Button>
              </Link>
              <Link to="/summary">
                <Button variant={isActive('/summary') ? 'default' : 'ghost'}>
                  Summarize
                </Button>
              </Link>
              <Link to="/presentation">
                <Button variant={isActive('/presentation') ? 'default' : 'ghost'}>
                  Presentations
                </Button>
              </Link>
              <Link to="/about">
                <Button variant={isActive('/about') ? 'default' : 'ghost'}>
                  About
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" className="gap-2">
                <User className="size-4" />
                {user.name}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
