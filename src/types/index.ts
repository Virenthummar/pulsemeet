export type ActivityCategory = 
  | 'Walking'
  | 'Sports'
  | 'Games'
  | 'Food'
  | 'Fitness'
  | 'Study'
  | 'Outdoors'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  interests: string[];
  verified: boolean;
  phoneVerified: boolean;
  rating: number;
  reviewsCount: number;
  activitiesHostedCount: number;
  activitiesJoinedCount: number;
  joinedDate: string;
  lat?: number;
  lng?: number;
  notificationSettings?: {
    emailNewNearbyPosts: boolean;
    radiusKm: number;
    categories: string[];
  };
}

export interface ActivityParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  isVerified: boolean;
  joinedAt: string;
  status: 'confirmed' | 'waitlisted' | 'pending';
}

export interface WeatherForecast {
  temp: number;
  condition: string;
  rainProbability: number;
  isOutdoorWarning: boolean;
  warningText?: string;
}

export interface Activity {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostVerified: boolean;
  hostRating: number;
  title: string;
  category: ActivityCategory;
  description: string;
  datetime: string;
  lat: number;
  lng: number;
  address: string;
  approxLocation: string;
  exactMeetingPoint: string;
  maxParticipants?: number;
  participants: ActivityParticipant[];
  waitlist: ActivityParticipant[];
  visibility: 'public' | 'invite_only';
  requiresApproval: boolean;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  distanceKm?: number;
  weather?: WeatherForecast;
}

export interface ChatMessage {
  id: string;
  activityId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'join' | 'approval' | 'reminder' | 'waitlist' | 'chat' | 'cancelled' | 'match';
  activityId?: string;
  timestamp: string;
  read: boolean;
}

export interface HostReview {
  id: string;
  activityId: string;
  hostId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface HangoutSignal {
  id: string;
  fromUserId: string;
  toUserId: string;
  activityId: string;
  wantsAgain: boolean;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: ActivityCategory[];
  maxDistanceKm: number;
  dateRange: 'all' | 'today' | 'tomorrow' | 'weekend';
  onlyAvailable: boolean;
  viewMode: 'list' | 'map';
  sortBy: 'soonest' | 'distance' | 'popular';
}
