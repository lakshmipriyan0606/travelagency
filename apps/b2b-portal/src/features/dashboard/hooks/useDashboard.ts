/**
 * Dashboard Feature — React Query hooks.
 *
 * Reuses the workspace-shared UseFetchAPIQuery and useMutationAPIQuery
 * helpers to interact with the service layer.
 */

import { UseFetchAPIQuery } from '@travelagency/hooks';
import { useMutationAPIQuery } from '@travelagency/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import {
  DASHBOARD_QUERY_KEYS,
  DASHBOARD_STALE_TIME_MS,
} from '../config/dashboard.config';

/**
 * Hook to retrieve the aggregate dashboard summary.
 */
export function useDashboardSummary() {
  return UseFetchAPIQuery({
    key: DASHBOARD_QUERY_KEYS.summary(),
    queryFn: () => dashboardService.getSummary(),
    options: {
      staleTime: DASHBOARD_STALE_TIME_MS,
    },
  });
}

/**
 * Hook to fetch notifications.
 */
export function useNotifications() {
  return UseFetchAPIQuery({
    key: DASHBOARD_QUERY_KEYS.notifications(),
    queryFn: () => dashboardService.getNotifications(),
    options: {
      refetchInterval: 1000 * 60 * 5, // Poll every 5 minutes in background
    },
  });
}

/**
 * Hook to mark a specific notification as read.
 * Invalidates notification and summary query caches on success.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<string, Error, string>(
    (id) => dashboardService.markAsRead(id),
    {
      showToast: false,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.notifications() });
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.summary() });
      },
    }
  );
}

/**
 * Hook to mark all notifications as read.
 * Invalidates notification and summary query caches on success.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<boolean, Error, void>(
    () => dashboardService.markAllAsRead(),
    {
      showToast: false,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.notifications() });
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.summary() });
      },
    }
  );
}
