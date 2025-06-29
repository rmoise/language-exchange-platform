import { Session, BookingRequest, TimeSlot, Availability } from './types';
import { notifyXPGain } from '@/features/gamification/utils/xpNotifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const bookingService = {
  // Fetch user's sessions (as host or guest)
  async getUserSessions(userId: string, role?: 'host' | 'guest'): Promise<Session[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/sessions?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    
    return response.json();
  },

  // Fetch available time slots for a user on a specific date
  async getAvailableSlots(userId: string, date: string): Promise<TimeSlot[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/availability?date=${date}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch available slots');
    }
    
    return response.json();
  },

  // Create a new booking request
  async createBooking(booking: BookingRequest): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(booking),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }
    
    return response.json();
  },

  // Update session status (confirm, cancel, etc.)
  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update session status');
    }
    
    // Show XP notification when session is completed
    if (status === 'completed') {
      notifyXPGain('SESSION_COMPLETE');
    }
    
    return response.json();
  },

  // Get user's availability settings
  async getUserAvailability(userId: string): Promise<Availability[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/availability-settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch availability settings');
    }
    
    return response.json();
  },

  // Update user's availability settings
  async updateUserAvailability(userId: string, availability: Availability[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/availability-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ availability }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update availability settings');
    }
  },

  // Mock data for development
  getMockSessions(): Session[] {
    const today = new Date();
    const sessions: Session[] = [];
    
    // Add some mock sessions
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      sessions.push({
        id: `session-${i}`,
        hostId: 'host-123',
        hostName: 'Maria Garcia',
        hostAvatar: 'https://i.pravatar.cc/150?img=5',
        guestId: 'guest-456',
        guestName: 'John Smith',
        date: date.toISOString(),
        startTime: '10:00 AM',
        endTime: '10:30 AM',
        status: i === 0 ? 'confirmed' : i === 1 ? 'pending' : 'completed',
        languages: {
          native: ['Spanish'],
          target: ['English'],
        },
        meetingLink: i === 0 ? 'https://meet.google.com/xyz-abc-def' : undefined,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      });
    }
    
    return sessions;
  },

  getMockAvailableSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        // Randomly mark some slots as unavailable
        const isAvailable = Math.random() > 0.3;
        
        slots.push({
          id: `slot-${hour}-${minute}`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          available: isAvailable,
          bookedBy: isAvailable ? undefined : 'user-123',
        });
      }
    }
    
    return slots;
  },
};