"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  Notification,
} from "@/store/services/notificationApi";
import { Bell, Trash2, Check, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/notifications", name: "Notifications" },
];

// ✅ Utility function to safely render HTML content
const createMarkup = (html: string) => {
  return { __html: html };
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, isFetching } = useGetNotificationsQuery({
    page,
    skip: (page - 1) * limit,
    limit,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isFetching}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-600">
                  When you get notifications, they'll show up here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: Notification) => (
                <Card
                  key={notification.id}
                  className={`transition-colors ${
                    !notification.is_read ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.is_read
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <Bell
                          className={`w-5 h-5 ${
                            !notification.is_read
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div
                            className={`text-sm ${
                              !notification.is_read
                                ? "font-semibold text-gray-900"
                                : "text-gray-700"
                            }`}
                            dangerouslySetInnerHTML={createMarkup(notification.message)}
                          />
                          {!notification.is_read && (
                            <Badge variant="default" className="flex-shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(notification.sent_at || notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
