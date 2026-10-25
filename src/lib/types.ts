export type UserRole = 'organizer' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  phone?: string;
  createdAt: string;
}

export type EventCategory =
  | 'Environment'
  | 'Education'
  | 'Health'
  | 'Community'
  | 'Animal Welfare'
  | 'Arts & Culture'
  | 'Food Security'
  | 'Crisis Relief';

export type EventStatus = 'draft' | 'published' | 'closed' | 'completed' | 'cancelled';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string e.g. "2026-11-15T09:00:00.000Z"
  endDate?: string;
  location: string;
  isVirtual: boolean;
  category: EventCategory;
  maxCapacity: number;
  registeredCount: number;
  requiredSkills: string[];
  registrationDeadline: string; // ISO string
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ParticipationStatus = 'Registered' | 'Confirmed' | 'Attended' | 'Cancelled';

export interface Registration {
  id: string; // e.g. "REG-109283"
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  selectedSkill: string;
  notes?: string;
  emergencyContact?: string;
  status: ParticipationStatus;
  registeredAt: string;
  updatedAt: string;
  qrCodeToken: string;
}

export interface AiGeneratedEvent {
  title: string;
  description: string;
  category: EventCategory;
  suggestedVolunteerRoles: string[];
  requiredSkills: string[];
  promotionalMessage: string;
  suggestedCapacity: number;
}
