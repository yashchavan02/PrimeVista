const statusColors = {
  uploaded: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  ready: 'bg-green-500/20 text-green-400 border border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const StatusBadge = ({ status }) => {
  const colorClass = statusColors[status] || statusColors.uploaded;

  return (
    <span className={`${colorClass} text-xs px-3 py-1 rounded-full capitalize font-medium`}>
      {status}
    </span>
  );
};

export default StatusBadge;
