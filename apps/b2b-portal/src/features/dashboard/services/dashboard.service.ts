/**
 * Dashboard Feature — service layer.
 *
 * Interfaces with the production backend REST APIs using the Axios apiClient.
 */

import apiClient from '@/lib/apiClient';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  DashboardSummary,
  PortalNotification,
} from '../types/dashboard.types';

export const dashboardService = {
  /**
   * Fetches the complete aggregate summary for the main landing page.
   */
  async getSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get(ENDPOINTS.client.dashboard.summary);
    return res.data.data || (res.data as DashboardSummary);
  },

  /**
   * Fetches all current portal notifications.
   */
  async getNotifications(): Promise<{
    data: readonly PortalNotification[];
    unreadCount: number;
  }> {
    const res = await apiClient.get(ENDPOINTS.client.dashboard.notifications);
    return {
      data: res.data.data,
      unreadCount: res.data.unreadCount || 0,
    };
  },

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(id: string): Promise<string> {
    const res = await apiClient.patch(ENDPOINTS.client.dashboard.markNotificationRead(id));
    return res.data.data.id;
  },

  /**
   * Marks all agency notifications as read.
   */
  async markAllAsRead(): Promise<boolean> {
    const res = await apiClient.post(ENDPOINTS.client.dashboard.markAllNotificationsRead);
    return res.data.success;
  },
};
export default dashboardService;
