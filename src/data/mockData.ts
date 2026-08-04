import { Activity, User, ChatMessage, NotificationItem, HostReview } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_me',
  name: 'New User',
  email: 'user@pulsemeet.app',
  bio: 'Welcome to PulseMeet! Post your first hangout or discover nearby activities.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  interests: ['Walking', 'Outdoors', 'Coffee', 'Sports', 'Games'],
  verified: true,
  phoneVerified: true,
  rating: 5.0,
  reviewsCount: 0,
  activitiesHostedCount: 0,
  activitiesJoinedCount: 0,
  joinedDate: 'Today'
};

export const MOCK_USERS: User[] = [
  CURRENT_USER
];

export const MOCK_ACTIVITIES: Activity[] = [];

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [];

export const MOCK_REVIEWS: HostReview[] = [];
