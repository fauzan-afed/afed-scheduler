'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import pb, { PbUser, PbMeeting, PbMeetingExpanded, PbMeetingAttendee } from '@/lib/pocketbase';
import { AvatarFullConfig, genConfig } from 'react-nice-avatar';
import { Meeting, Attendee } from '@/components/EventCard';

// Current user interface
export interface CurrentUser {
    id: string;
    name: string;
    department: string;
    gender: 'male' | 'female';
    avatarConfig: AvatarFullConfig;
}

// Convert PbUser to CurrentUser
function pbUserToCurrentUser(pbUser: PbUser): CurrentUser {
    return {
        id: pbUser.id,
        name: pbUser.name,
        department: pbUser.department,
        gender: pbUser.gender,
        avatarConfig: pbUser.avatarConfig as AvatarFullConfig,
    };
}

// Convert PbMeetingExpanded to Meeting
function pbMeetingToMeeting(pbMeeting: PbMeetingExpanded, attendees: PbMeetingAttendee[]): Meeting {
    return {
        id: pbMeeting.id,
        ownerId: pbMeeting.owner?.id || '',
        title: pbMeeting.title,
        start: new Date(pbMeeting.start),
        end: new Date(pbMeeting.end),
        attendees: attendees.map(a => ({
            id: a.user?.id || a.id,
            name: a.name,
            avatar: a.avatar,
            avatarConfig: a.avatarConfig as AvatarFullConfig | undefined,
        })),
    };
}

// Auth Hook
export function useAuth() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const authData = pb.authStore.model as PbUser | null;
        if (authData) {
            setUser(pbUserToCurrentUser(authData));
        }
        setLoading(false);

        // Listen to auth changes
        const unsubscribe = pb.authStore.onChange(() => {
            const authUser = pb.authStore.model as PbUser | null;
            if (authUser) {
                setUser(pbUserToCurrentUser(authUser));
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            const currentUser = pbUserToCurrentUser(authData.record as PbUser);
            setUser(currentUser);
            return { success: true, user: currentUser };
        } catch (error: any) {
            return { success: false, error: error.message || 'Login failed' };
        }
    }, []);

    const logout = useCallback(() => {
        pb.authStore.clear();
        setUser(null);
    }, []);

    return { user, loading, login, logout };
}

// User Registration Hook
export function useUser() {
    const register = useCallback(async (userData: {
        name: string;
        department: string;
        gender: 'male' | 'female';
        avatarConfig: AvatarFullConfig;
        deviceId: string;
    }) => {
        try {
            console.log('[useUser.register] Starting registration for:', userData.name);

            // Create user with random email/password for device-based auth
            const randomId = Math.random().toString(36).substring(2, 15);
            const email = `device-${userData.deviceId}@afed-scheduler.local`;
            const password = Math.random().toString(36).substring(2, 20);

            console.log('[useUser.register] Creating user with email:', email);

            const createdUser = await pb.collection('users').create({
                email,
                password,
                passwordConfirm: password,
                name: userData.name,
                department: userData.department,
                gender: userData.gender,
                avatarConfig: userData.avatarConfig,
                deviceId: userData.deviceId,
            });

            console.log('[useUser.register] User created successfully:', createdUser.id);

            // Auto-login after registration and wait for auth store to update
            console.log('[useUser.register] Attempting to login...');
            await pb.collection('users').authWithPassword(email, password);

            console.log('[useUser.register] Login successful, token:', pb.authStore.token ? 'exists' : 'missing');

            // Wait for auth store to be fully populated
            let retries = 0;
            while (!pb.authStore.token && retries < 10) {
                await new Promise(resolve => setTimeout(resolve, 50));
                retries++;
            }

            if (!pb.authStore.token) {
                throw new Error('Authentication failed after registration');
            }

            console.log('[useUser.register] Registration complete');
            return { success: true, user: pbUserToCurrentUser(createdUser as PbUser) };
        } catch (error: any) {
            console.error('[useUser.register] Error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    }, []);

    const getDeviceUser = useCallback(async (deviceId: string) => {
        try {
            // Try to find existing user by deviceId
            const users = await pb.collection('users').getList(1, 1, {
                filter: `deviceId = "${deviceId}"`,
            });

            if (users.totalItems > 0) {
                const existingUser = users.items[0] as PbUser;
                // Auto-login with existing user
                const email = existingUser.email;
                if (email) {
                    // For device-based users, we need to set the auth token differently
                    // This is a simplified approach - in production, you'd want proper password handling
                    await pb.collection('users').authRefresh();
                    return { success: true, user: pbUserToCurrentUser(existingUser), exists: true };
                }
            }

            return { success: true, user: null, exists: false };
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to check device' };
        }
    }, []);

    return { register, getDeviceUser };
}

// Rooms Hook
export function useRooms() {
    const [rooms, setRooms] = useState<Record<string, { id: string; name: string; modelPath: string }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                setLoading(true);
                const result = await pb.collection('rooms').getList(1, 50, {
                    filter: 'isActive = true',
                });

                const roomsMap: Record<string, { id: string; name: string; modelPath: string }> = {};
                result.items.forEach(room => {
                    roomsMap[room.id] = {
                        id: room.id,
                        name: room.name,
                        modelPath: room.modelPath || '/model.gltf',
                    };
                });

                setRooms(roomsMap);
            } catch (error: any) {
                console.error('Failed to load rooms:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRooms();
    }, []);

    return { rooms, loading };
}

// Meetings Hook
export function useMeetings(roomId: string, date: Date) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    // Use refs to avoid infinite loops
    const dateRef = useRef(date);
    const roomIdRef = useRef(roomId);

    // Update refs without triggering re-renders
    useEffect(() => {
        dateRef.current = date;
        roomIdRef.current = roomId;
    }, [date, roomId]);

    // Load meetings for the specific date and room
    const loadMeetings = useCallback(async () => {
        if (!roomIdRef.current) return;

        try {
            setLoading(true);

            // Get the start and end of the day from refs
            const currentDate = dateRef.current;
            const startOfDay = new Date(currentDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(currentDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Query meetings for the room and date
            const result = await pb.collection('meetings').getList(1, 50, {
                filter: `room = "${roomIdRef.current}" && start >= "${startOfDay.toISOString()}" && start <= "${endOfDay.toISOString()}" && status != "cancelled"`,
                expand: 'owner,room',
                sort: '+start',
            });

            const meetingsData: Meeting[] = [];

            // Fetch attendees for each meeting
            for (const meeting of result.items as PbMeetingExpanded[]) {
                const attendees = await pb.collection('meeting_attendees').getList(1, 50, {
                    filter: `meeting = "${meeting.id}"`,
                });

                meetingsData.push(pbMeetingToMeeting(meeting, attendees.items as PbMeetingAttendee[]));
            }

            setMeetings(meetingsData);
        } catch (error: any) {
            console.error('Failed to load meetings:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Empty deps - uses refs instead

    // Create meeting
    const createMeeting = useCallback(async (data: {
        title: string;
        start: Date;
        end: Date;
        user: CurrentUser;
    }) => {
        try {
            const currentRoomId = roomIdRef.current;
            if (!currentRoomId) {
                return { success: false, error: 'No room selected' };
            }

            // Create the meeting with the provided roomId
            const meeting = await pb.collection('meetings').create({
                room: currentRoomId,
                owner: data.user.id,
                title: data.title,
                start: data.start.toISOString(),
                end: data.end.toISOString(),
                status: 'scheduled',
            });

            // Add the creator as an attendee
            await pb.collection('meeting_attendees').create({
                meeting: meeting.id,
                user: data.user.id,
                name: data.user.name,
                avatarConfig: data.user.avatarConfig,
                isExternal: false,
            });

            // Reload meetings
            await loadMeetings();

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to create meeting' };
        }
    }, [loadMeetings]);

    // Delete meeting
    const deleteMeeting = useCallback(async (meetingId: string) => {
        try {
            await pb.collection('meetings').delete(meetingId);
            setMeetings(prev => prev.filter(m => m.id !== meetingId));
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to delete meeting' };
        }
    }, []);

    // Load meetings on mount and when date/room changes
    useEffect(() => {
        loadMeetings();
    }, [roomId, date]); // This is fine - roomId and date are primitive values

    // Subscribe to real-time updates with debouncing
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const unsubscribe = pb.collection('meetings').subscribe('*', (e) => {
            const record = e.record as PbMeeting;

            // Only reload if it's for our room
            if (record.room === roomIdRef.current) {
                // Debounce rapid changes
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    loadMeetings();
                }, 300); // 300ms debounce
            }
        });

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            unsubscribe.catch(console.error);
        };
    }, [roomId, loadMeetings]); // Dependencies are now stable

    return { meetings, loading, createMeeting, deleteMeeting, reload: loadMeetings };
}
