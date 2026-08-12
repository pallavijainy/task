import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { LogOut, User } from 'lucide-react';
import Badge from '../ui/Badge';
import { useState } from 'react';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'admin') return 'danger';
    if (role === 'manager') return 'warning';
    return 'info';
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Title */}
        <div>
          {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <Badge variant={getRoleBadgeVariant(user?.role)} className="text-xs">
                  {user?.role}
                </Badge>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft-lg border border-slate-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
