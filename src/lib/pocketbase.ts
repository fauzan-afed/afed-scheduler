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

export default pb;
