import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Coins,
  FolderKanban,
  Code2,
  Package,
  Calendar,
  CheckCircle2,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit_reward':
        return <Coins className="w-4 h-4 text-[#EFC66B]" />;
      case 'project_invite':
        return <FolderKanban className="w-4 h-4 text-[#26783C]" />;
      case 'question_unlock':
        return <Code2 className="w-4 h-4 text-[#173D2A]" />;
      case 'resource_request':
        return <Package className="w-4 h-4 text-[#26783C]" />;
      case 'event_reminder':
        return <Calendar className="w-4 h-4 text-[#173D2A]" />;
      default:
        return <Bell className="w-4 h-4 text-[#687769]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5 text-[#26783C]" />
            Activity Alerts
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Real-time updates regarding project invites, verified credits, and question unlocks.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCE6D2] hover:bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold rounded-btn transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5 text-[#26783C]" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-subtle p-4 divide-y divide-[#DCE6D2]/60">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-[#687769] space-y-2">
            <Bell className="w-8 h-8 mx-auto opacity-40 text-[#173D2A]" />
            <div className="font-semibold text-sm text-[#173D2A]">No notifications yet</div>
            <p className="text-xs">You're all caught up on campus events!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-3.5 rounded-xl transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                !n.isRead ? 'bg-[#EAF1DC]/70 font-medium' : 'hover:bg-[#EEF4E3]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAFCF5] border border-[#DCE6D2] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#173D2A]">{n.title}</div>
                  <div className="text-xs text-[#687769] mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-[#A2BA95] mt-1">{n.createdAt}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#26783C]" title="Unread" />
                )}
                {n.linkUrl && (
                  <Link
                    to={n.linkUrl}
                    className="p-1 rounded text-[#687769] hover:text-[#173D2A]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
