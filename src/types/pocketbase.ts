import { AvatarFullConfig } from 'react-nice-avatar';

// PocketBase Record Response Wrapper
export interface PbResponse<T> {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  [key: string]: any;
}

// User Record
export interface PbUser extends PbResponse<{
  email?: string;
  name: string;
  department: 'Consumer' | 'Energy' | 'Tricipta' | 'Others';
  gender: 'male' | 'female';
  avatarConfig: AvatarFullConfig;
  deviceId?: string;
}> {}

// Room Record
export interface PbRoom extends PbResponse<{
  name: string;
  modelPath?: string;
  capacity?: number;
  floorLevel?: string;
  isActive: boolean;
}> {}

// Meeting Record
export interface PbMeeting extends PbResponse<{
  room: string; // relation ID
  owner: string; // relation ID
  title: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  status: 'scheduled' | 'cancelled' | 'completed';
  remark?: string;
}> {}

// Meeting with Expansions
export interface PbMeetingExpanded extends PbResponse<{
  room: PbRoom;
  owner: PbUser;
  title: string;
  start: string;
  end: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  remark?: string;
}> {}

// Meeting Attendee Record
export interface PbMeetingAttendee extends PbResponse<{
  meeting: string; // relation ID
  user?: string; // relation ID (null for external)
  name: string;
  avatar?: string; // external avatar URL
  avatarConfig?: AvatarFullConfig;
  isExternal: boolean;
}> {}

// Meeting Attendee with Expansion
export interface PbMeetingAttendeeExpanded extends PbResponse<{
  meeting: PbMeeting;
  user?: PbUser;
  name: string;
  avatar?: string;
  avatarConfig?: AvatarFullConfig;
  isExternal: boolean;
}> {}

// List Response
export interface PbListResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

// Auth Store
export interface PbAuthStore {
  token: string;
  model: PbUser | null;
}

// Convert PocketBase Meeting to App Meeting
export function pbToAppMeeting(pbMeeting: PbMeetingExpanded, attendees: PbMeetingAttendeeExpanded[]) {
  return {
    id: pbMeeting.id,
    ownerId: pbMeeting.owner.id,
    title: pbMeeting.title,
    start: new Date(pbMeeting.start),
    end: new Date(pbMeeting.end),
    attendees: attendees.map(a => ({
      id: a.user?.id || a.id,
      name: a.name,
      avatarConfig: a.avatarConfig,
      avatar: a.avatar
    }))
  };
}

// Convert App Attendee to PocketBase
export function appToPbAttendee(meetingId: string, name: string, userId?: string, avatarConfig?: AvatarFullConfig) {
  return {
    meeting: meetingId,
    user: userId || null,
    name: name,
    avatarConfig: avatarConfig || null,
    isExternal: !userId
  };
}
