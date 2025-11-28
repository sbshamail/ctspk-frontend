import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";

export interface Notification {
  created_at: string;
  updated_at: string;
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  read_at: string | null;
  sent_at: string;
}

export interface NotificationListResponse {
  success: number;
  detail: string;
  data: Notification[];
  total: number;
}

export interface UnreadCountResponse {
  success: number;
  detail: string;
  data: {
    unread_count: number;
  };
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: createBaseQuery("/notification"),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    // Get notification list
    getNotifications: builder.query<NotificationListResponse, { page?: number; skip?: number; limit?: number }>({
      query: ({ page = 1, skip = 0, limit = 10 }) => `/list?page=${page}&skip=${skip}&limit=${limit}`,
      providesTags: ["Notifications"],
    }),

    // Get unread count
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "/unread-count",
      providesTags: ["UnreadCount"],
    }),

    // Mark single notification as read
    markAsRead: builder.mutation<any, number>({
      query: (id) => ({
        url: `/${id}/mark-as-read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    // Bulk mark as read
    bulkMarkAsRead: builder.mutation<any, { notification_ids: number[] }>({
      query: (body) => ({
        url: "/bulk-mark-as-read",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<any, void>({
      query: () => ({
        url: "/mark-all-as-read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    // Delete notification
    deleteNotification: builder.mutation<any, number>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useBulkMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
