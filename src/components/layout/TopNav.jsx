import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, User, Radar } from 'lucide-react';

export default function TopNav() {
  const location = useLocation();

  return (
    <header className="glass-card sticky top-0 z-50 border-b-0 border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-fuchsia-500/10 p-2 rounded-lg group-hover:bg-fuchsia-500/20 border border-fuchsia-500/30 transition-colors shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              <Plane className="w-5 h-5 text-fuchsia-400 stroke-2" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white aurora-text">
              FlightGlobe
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-fuchsia-400' : 'text-slate-300 hover:text-fuchsia-300'}`}>Flights</Link>
            <Link to="/tracking" className={`text-sm font-medium transition-colors ${location.pathname === '/tracking' ? 'text-fuchsia-400' : 'text-slate-300 hover:text-fuchsia-300'}`}>Live Radar</Link>
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-fuchsia-400' : 'text-slate-300 hover:text-fuchsia-300'}`}>My Trips</Link>
            <button className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors">
              <User className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
