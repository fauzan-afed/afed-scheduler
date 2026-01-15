'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SlotInfo } from 'react-big-calendar';
import Header from '@/components/Header';
import RoomCard from '@/components/RoomCard';
import DayCalendar from '@/components/DayCalendar';
import BookButton from '@/components/BookButton';
import BookingModal from '@/components/BookingModal';
import MeetingDetailModal from '@/components/MeetingDetailModal';
import RegistrationModal from '@/components/RegistrationModal';
import { Meeting, Attendee } from '@/components/EventCard';
import { AvatarFullConfig } from 'react-nice-avatar';
import { useAuth, useMeetings, useUser, useRooms, CurrentUser } from '@/hooks/usePocketBase';

interface SchedulerPageProps {
    roomId?: string;
}

// Get today and tomorrow dates
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
};

export default function SchedulerPage({ roomId }: SchedulerPageProps) {
    // Memoize today and tomorrow to prevent unnecessary re-renders
    const today = React.useMemo(() => getToday(), []);
    const tomorrow = React.useMemo(() => getTomorrow(), []);

    // State for current date (must be declared before useMeetings)
    const [currentDate, setCurrentDate] = useState<Date>(today);

    // Use PocketBase hooks
    const { user: currentUser, loading: authLoading } = useAuth();
    const { register, getDeviceUser } = useUser();
    const { rooms, loading: roomsLoading } = useRooms();
    const { meetings, loading: meetingsLoading, createMeeting, deleteMeeting, reload: reloadMeetings } = useMeetings(
        roomId || '',
        currentDate
    );

    // Get room info based on roomId - memoize to prevent unnecessary re-renders
    const roomInfo = React.useMemo(() => {
        return roomId && rooms[roomId]
            ? rooms[roomId]
            : { id: roomId || '', name: 'Meeting Room', modelPath: '/model.gltf' };
    }, [roomId, rooms]);

    // Find first room if no roomId specified
    const firstRoomId = Object.keys(rooms)[0] || '';
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [pendingMeeting, setPendingMeeting] = useState<{ title: string; start: Date; end: Date } | null>(null);

    // Check for device-based user on mount (optional - for tablet one-time registration)
    useEffect(() => {
        const deviceId = localStorage.getItem('afed_device_id');
        if (deviceId && !currentUser) {
            getDeviceUser(deviceId);
        }
    }, [currentUser, getDeviceUser]);

    // Check if we can navigate
    const isToday = currentDate.toDateString() === today.toDateString();
    const isTomorrow = currentDate.toDateString() === tomorrow.toDateString();

    const canGoPrev = isTomorrow; // Can go back only if on tomorrow
    const canGoNext = isToday; // Can go forward only if on today

    const handlePrevDay = () => {
        if (canGoPrev) {
            setCurrentDate(today);
        }
    };

    const handleNextDay = () => {
        if (canGoNext) {
            setCurrentDate(tomorrow);
        }
    };

    const handleDateChange = (date: Date) => {
        // Allow any date selection
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        setCurrentDate(selectedDate);
    };

    const handleBookMeeting = () => {
        // Open modal without prefilling time
        setSelectedTime(null);
        setIsBookingModalOpen(true);
    };

    const handleSlotSelect = useCallback((slotInfo: SlotInfo) => {
        // Open booking modal with prefilled time from clicked slot
        setSelectedTime(slotInfo.start);
        setIsBookingModalOpen(true);
    }, []);

    const handleEventSelect = useCallback((meeting: Meeting) => {
        // Open detail modal with selected meeting
        setSelectedMeeting(meeting);
        setIsDetailModalOpen(true);
    }, []);

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        setSelectedTime(null);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedMeeting(null);
    };

    const handleConfirmBooking = async (newMeeting: { title: string; start: Date; end: Date }) => {
        if (!currentUser) {
            // First time user - save the meeting and open registration
            setPendingMeeting(newMeeting);
            setIsBookingModalOpen(false);
            setIsRegistrationModalOpen(true);
            return;
        }

        // Create meeting via PocketBase
        const result = await createMeeting({
            title: newMeeting.title,
            start: newMeeting.start,
            end: newMeeting.end,
            user: currentUser,
        });

        if (result.success) {
            setIsBookingModalOpen(false);
        } else {
            console.error('Failed to create meeting:', result.error);
            alert('Failed to create meeting: ' + result.error);
        }
    };

    const handleDeleteMeeting = async (meetingId: string) => {
        setIsDeletingMeeting(true);
        const result = await deleteMeeting(meetingId);
        if (result.success) {
            setIsDetailModalOpen(false);
            setSelectedMeeting(null);
        } else {
            console.error('Failed to delete meeting:', result.error);
            alert('Failed to delete meeting: ' + result.error);
        }
        setIsDeletingMeeting(false);
    };

    const handleRegister = async (userData: CurrentUser & { deviceId: string }) => {
        console.log('Starting registration...');
        setIsRegistering(true);

        // Generate device ID if not exists
        const deviceId = userData.deviceId || `device-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        localStorage.setItem('afed_device_id', deviceId);

        console.log('Calling register with deviceId:', deviceId);

        const result = await register({
            name: userData.name,
            department: userData.department,
            gender: userData.gender,
            avatarConfig: userData.avatarConfig,
            deviceId: deviceId,
        });

        console.log('Registration result:', result);

        if (result.success && result.user) {
            console.log('Registration successful, closing modal');
            setIsRegistrationModalOpen(false);

            if (pendingMeeting) {
                console.log('Creating pending meeting:', pendingMeeting);
                const createResult = await createMeeting({
                    title: pendingMeeting.title,
                    start: pendingMeeting.start,
                    end: pendingMeeting.end,
                    user: result.user,
                });

                if (createResult.success) {
                    console.log('Meeting created successfully, reloading meetings');
                    // Reload meetings to show the new one
                    await reloadMeetings();
                }

                setPendingMeeting(null);
            }
        } else {
            console.error('Registration failed:', result.error);
            alert('Registration failed: ' + result.error);
        }

        setIsRegistering(false);
    };

    // Filter meetings for current date
    const currentDateMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.start);
        return meetingDate.toDateString() === currentDate.toDateString();
    });


    return (
        <main className="page">
            {(meetingsLoading || isRegistering || isDeletingMeeting) && (
                <div className="loading-overlay">
                    <div className="loading-spinner" />
                    <p className="loading-text">
                        {isRegistering ? 'Registering...' : isDeletingMeeting ? 'Deleting...' : 'Loading...'}
                    </p>
                </div>
            )}

            <Header
                date={currentDate}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                onPrev={handlePrevDay}
                onNext={handleNextDay}
                onDateChange={handleDateChange}
            />

            <RoomCard
                name={roomInfo.name}
                modelPath={roomInfo.modelPath}
            />

            <DayCalendar
                date={currentDate}
                events={currentDateMeetings}
                onSlotSelect={handleSlotSelect}
                onEventSelect={handleEventSelect}
            />

            <BookButton onClick={handleBookMeeting} />

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                onBook={handleConfirmBooking}
                selectedTime={selectedTime}
                date={currentDate}
                existingMeetings={currentDateMeetings}
            />

            <RegistrationModal
                isOpen={isRegistrationModalOpen}
                onClose={() => setIsRegistrationModalOpen(false)}
                onRegister={handleRegister}
                isLoading={isRegistering}
            />

            <MeetingDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                meeting={selectedMeeting}
                currentUser={currentUser}
                onDelete={handleDeleteMeeting}
            />
        </main>
    );
}
