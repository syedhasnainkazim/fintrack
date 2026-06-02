import { NavLink, useNavigate } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, ArrowLeftRight, Target, LineChart, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard' },
  { to: '/transactions', icon: <ArrowLeftRight className="h-4 w-4" />, label: 'Transactions' },
  { to: '/budgets', icon: <Target className="h-4 w-4" />, label: 'Budgets' },
  { to: '/net-worth', icon: <LineChart className="h-4 w-4" />, label: 'Net Worth' },
  { to: '/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Signed out');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[#242831] bg-[#13151b] transition-transform duration-200 lg:relative lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#4e7cf6]">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#c9d1e0]">FinTrack</span>
          </div>
          <button onClick={onClose} className="text-[#606880] hover:text-[#c9d1e0] lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#4e7cf6]/10 text-[#4e7cf6]'
                    : 'text-[#606880] hover:bg-[#1a1d25] hover:text-[#c9d1e0]'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#242831] px-2 py-3">
          <div className="mb-1 px-3 py-1.5">
            <p className="truncate text-sm font-medium text-[#c9d1e0]">{user?.name}</p>
            <p className="truncate text-xs text-[#606880]">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#606880] transition-colors hover:bg-[#e84057]/10 hover:text-[#e84057]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
