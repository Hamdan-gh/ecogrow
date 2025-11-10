import { CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export function Notification({ message, type }: NotificationProps) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-6 py-3 rounded-lg shadow-card-hover ${type === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
}
