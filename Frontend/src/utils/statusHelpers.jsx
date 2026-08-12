import Badge from '../components/ui/Badge';

export const getStatusBadge = (status, text) => {
  const statusConfig = {
    completed: { variant: 'success', label: text || 'Completed' },
    incomplete: { variant: 'warning', label: text || 'Incomplete' },
    pending: { variant: 'info', label: text || 'Pending' },
    valid: { variant: 'success', label: text || 'Valid' },
    invalid: { variant: 'danger', label: text || 'Invalid' },
    approved: { variant: 'success', label: text || 'Approved' },
    rejected: { variant: 'danger', label: text || 'Rejected' },
    none: { variant: 'default', label: text || 'None' },
    present: { variant: 'success', label: text || 'Present' },
    absent: { variant: 'danger', label: text || 'Absent' },
  };

  const config = statusConfig[status?.toLowerCase()] || { variant: 'default', label: status };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatWorkingHours = (hours) => {
  if (!hours && hours !== 0) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
