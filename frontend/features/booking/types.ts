export interface TimeSlot {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  available: boolean;
  bookedBy?: string; // User ID if booked
}

export interface Session {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  guestId?: string;
  guestName?: string;
  date: string; // ISO string
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  languages: {
    native: string[];
    target: string[];
  };
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  slots: {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
}

export interface BookingRequest {
  hostId: string;
  date: string;
  startTime: string;
  endTime: string;
  message?: string;
  languages: {
    native: string[];
    target: string[];
  };
}