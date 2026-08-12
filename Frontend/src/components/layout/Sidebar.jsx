import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  FileText,
  UserCircle,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const getNavItems = () => {
    if (user?.role === 'employee') {
      return [
        { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'My Attendance', path: '/employee/attendance', icon: Calendar },
        { name: 'Overtime', path: '/employee/overtime', icon: Clock },
      ];
    } else if (user?.role === 'manager') {
      return [
        { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
        { name: 'Team Attendance', path: '/manager/attendance', icon: Users },
        { name: 'Overtime Requests', path: '/manager/overtime', icon: Clock },
        { name: 'Validation', path: '/manager/validation', icon: CheckSquare },
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Attendance', path: '/admin/attendance', icon: Calendar },
        { name: 'Overtime', path: '/admin/overtime', icon: Clock },
        { name: 'Validation', path: '/admin/validation', icon: CheckSquare },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto custom-scrollbar">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">AttendEase</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.name === 'Dashboard' && location.pathname === item.path.split('/').slice(0, 2).join('/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
