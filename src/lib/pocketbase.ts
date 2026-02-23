import PocketBase from 'pocketbase';

// Export types from types file
export type {
  PbUser,
  PbRoom,
  PbMeeting,
  PbMeetingExpanded,
  PbMeetingAttendee,
  PbMeetingAttendeeExpanded,
  PbListResponse,
  PbAuthStore
} from '@/types/pocketbase';

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
);

// Disable auto-cancellation for better auth state management
pb.autoCancellation(false);

/**
 * Helper function to execute API calls with automatic token refresh on auth failure
 * This prevents users from having to re-login when their token expires
 */
export async function withAutoRefresh<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
        return await apiCall();
    } catch (error: any) {
        // Check if this is an auth-related error
        const isAuthError =
            error.status === 401 ||
            error.status === 400 ||
            (error.data &&
                (
                    error.data.message?.toLowerCase().includes('auth') ||
                    error.data.message?.toLowerCase().includes('token') ||
                    error.data.message?.toLowerCase().includes('unauthorized') ||
                    error.data.message?.toLowerCase().includes('expired') ||
                    error.data.error?.toLowerCase().includes('no rows in result set') ||
                    error.data.error?.toLowerCase().includes('create rule failure')
                ));

        // If it's an auth error and we have a token, try to refresh
        if (isAuthError && pb.authStore.token) {
            console.log('[withAutoRefresh] Auth error detected, attempting to refresh token...');

            try {
                // Try to refresh the token
                await pb.collection('users').authRefresh();
                console.log('[withAutoRefresh] Token refreshed successfully, retrying request...');

                // Retry the original request
                return await apiCall();
            } catch (refreshError: any) {
                console.error('[withAutoRefresh] Token refresh failed:', refreshError);

                // If refresh also fails, clear auth store and rethrow
                pb.authStore.clear();
                throw new Error('Session expired. Please register again.');
            }
        }

        // If not an auth error or refresh not possible, rethrow original error
        throw error;
    }
}

export default pb;
