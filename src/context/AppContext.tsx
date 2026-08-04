import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  ChatMessage, 
  NotificationItem, 
  HostReview, 
  FilterState, 
  ActivityCategory 
} from '../types';
import { 
  CURRENT_USER, 
  MOCK_USERS,
  MOCK_ACTIVITIES, 
  MOCK_CHAT_MESSAGES, 
  MOCK_NOTIFICATIONS, 
  MOCK_REVIEWS 
} from '../data/mockData';

// Haversine formula to compute exact distance in KM between two geographic coordinates
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  activities: Activity[];
  chatMessages: Record<string, ChatMessage[]>;
  notifications: NotificationItem[];
  reviews: HostReview[];
  filters: FilterState;
  selectedActivityId: string | null;
  isCreateModalOpen: boolean;
  isSafetyModalOpen: boolean;
  isVerificationModalOpen: boolean;
  isNotificationDrawerOpen: boolean;
  userLocation: { lat: number; lng: number; label: string };
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Actions
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setSelectedActivityId: (id: string | null) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsSafetyModalOpen: (open: boolean) => void;
  setIsVerificationModalOpen: (open: boolean) => void;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number; label: string }) => void;
  
  switchUser: (userId: string) => void;
  createCustomUser: (name: string, bio: string, interestsStr: string, customAvatar?: string) => void;
  createActivity: (newActData: Omit<Activity, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostVerified' | 'hostRating' | 'participants' | 'waitlist' | 'createdAt' | 'status'>) => void;
  joinActivity: (activityId: string) => void;
  leaveActivity: (activityId: string) => void;
  sendChatMessage: (activityId: string, text: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  verifyUserPhoneAndId: () => void;
  reportItem: (targetType: 'user' | 'activity', targetId: string, reason: string) => void;
  blockUser: (targetUserId: string) => void;
  addHostReview: (hostId: string, activityId: string, rating: number, comment: string) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
  deleteUserProfile: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pulse_meet_app_state_v3_clean';

const RANDOM_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300'
];

export const getRandomAvatar = () => {
  return RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_activities');
    return saved ? JSON.parse(saved) : MOCK_ACTIVITIES;
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_chats');
    return saved ? JSON.parse(saved) : MOCK_CHAT_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [reviews, setReviews] = useState<HostReview[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const [userLocation, setUserLocation] = useState({
    lat: 23.0225,
    lng: 72.5714,
    label: 'Ahmedabad, Gujarat'
  });

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    maxDistanceKm: 25,
    dateRange: 'all',
    onlyAvailable: false,
    viewMode: 'list',
    sortBy: 'soonest'
  });

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

const CLOUD_SYNC_ENDPOINT = 'https://pulsemeet-app-default-rtdb.firebaseio.com/pulsemeet_v1.json';

  // Helper to push state updates to shared cloud database across devices
  const syncToCloud = async (overrideData?: any) => {
    try {
      const payload = overrideData || {
        activities,
        chatMessages,
        reviews,
        allUsers
      };
      await fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Cloud sync offline fallback');
    }
  };

  // Sync state to local storage and trigger cloud push
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_activities', JSON.stringify(activities));
    syncToCloud();
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_chats', JSON.stringify(chatMessages));
    syncToCloud();
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_reviews', JSON.stringify(reviews));
    syncToCloud();
  }, [reviews]);

  // Real-Time Cross-Device Sync Polling Engine (Every 4 seconds)
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const res = await fetch(CLOUD_SYNC_ENDPOINT);
        if (!res.ok) return;
        const data = await res.json();
        if (data) {
          if (data.activities && Array.isArray(data.activities)) {
            setActivities(data.activities);
          }
          if (data.chatMessages) {
            setChatMessages(data.chatMessages);
          }
          if (data.reviews && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
          }
          if (data.allUsers && Array.isArray(data.allUsers)) {
            setAllUsers(data.allUsers);
          }
        }
      } catch (e) {
        console.warn('Cloud fetch error');
      }
    };

    fetchCloudData();
    const interval = setInterval(fetchCloudData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Browser Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your Current GPS Location'
          });
        },
        () => {
          console.log('Using default location fallback');
        }
      );
    }
  }, []);

  // Switch Active User dynamically
  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setNotifications(nPrev => [
        {
          id: `notif_${Date.now()}`,
          userId: found.id,
          title: `Welcome back, ${found.name}!`,
          message: 'Switched profile session successfully.',
          type: 'reminder',
          timestamp: 'Just now',
          read: false
        },
        ...nPrev
      ]);
    }
  };

  // Create a brand new custom User profile dynamically
  const createCustomUser = (name: string, bio: string, interestsStr: string, customAvatar?: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'New Explorer',
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      bio: bio.trim() || 'Excited to discover nearby activities and make new friends!',
      avatar: customAvatar || getRandomAvatar(),
      interests: interestsStr.split(',').map(i => i.trim()).filter(Boolean),
      verified: true,
      phoneVerified: true,
      rating: 5.0,
      reviewsCount: 0,
      activitiesHostedCount: 0,
      activitiesJoinedCount: 0,
      joinedDate: 'Just now'
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
  };

  const createActivity = (newActData: Omit<Activity, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostVerified' | 'hostRating' | 'participants' | 'waitlist' | 'createdAt' | 'status'>) => {
    const newActivity: Activity = {
      ...newActData,
      id: `act_${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatar,
      hostVerified: currentUser.verified,
      hostRating: currentUser.rating,
      participants: [
        {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          isVerified: currentUser.verified,
          joinedAt: new Date().toISOString(),
          status: 'confirmed'
        }
      ],
      waitlist: [],
      createdAt: new Date().toISOString(),
      status: 'upcoming'
    };

    setActivities(prev => [newActivity, ...prev]);
    
    // Dynamically update user stats
    setCurrentUser(prev => ({
      ...prev,
      activitiesHostedCount: prev.activitiesHostedCount + 1
    }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, activitiesHostedCount: u.activitiesHostedCount + 1 } : u));

    // Dynamic initial welcome chat message
    setChatMessages(prev => ({
      ...prev,
      [newActivity.id]: [
        {
          id: `msg_sys_${Date.now()}`,
          activityId: newActivity.id,
          senderId: 'system',
          senderName: 'PulseMeet System',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
          text: `🎉 Activity created by ${currentUser.name}! Use this group chat to coordinate before meeting up.`,
          timestamp: 'Just now',
          isSystem: true
        }
      ]
    }));

    setIsCreateModalOpen(false);
    setSelectedActivityId(newActivity.id);
  };

  const joinActivity = (activityId: string) => {
    let activityTitle = '';
    
    setActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;
      
      activityTitle = act.title;
      const alreadyJoined = act.participants.some(p => p.userId === currentUser.id);
      if (alreadyJoined) return act;

      const isFull = act.maxParticipants ? act.participants.length >= act.maxParticipants : false;

      const newParticipant = {
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        isVerified: currentUser.verified,
        joinedAt: new Date().toISOString(),
        status: isFull ? ('waitlisted' as const) : ('confirmed' as const)
      };

      if (isFull) {
        return {
          ...act,
          waitlist: [...act.waitlist, newParticipant]
        };
      } else {
        return {
          ...act,
          participants: [...act.participants, newParticipant]
        };
      }
    }));

    // Dynamically post a system log into the group chat
    sendChatMessage(activityId, `👋 ${currentUser.name} joined the hangout!`);

    // Dynamically update user stats
    setCurrentUser(prev => ({
      ...prev,
      activitiesJoinedCount: prev.activitiesJoinedCount + 1
    }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, activitiesJoinedCount: u.activitiesJoinedCount + 1 } : u));
  };

  const leaveActivity = (activityId: string) => {
    setActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;

      const updatedParticipants = act.participants.filter(p => p.userId !== currentUser.id);
      const updatedWaitlist = act.waitlist.filter(p => p.userId !== currentUser.id);
      
      let finalParticipants = [...updatedParticipants];
      let finalWaitlist = [...updatedWaitlist];

      if (act.maxParticipants && updatedParticipants.length < act.maxParticipants && updatedWaitlist.length > 0) {
        const [promotedUser, ...remainingWaitlist] = updatedWaitlist;
        finalParticipants.push({ ...promotedUser, status: 'confirmed' });
        finalWaitlist = remainingWaitlist;

        if (promotedUser.userId === currentUser.id) {
          setNotifications(nPrev => [
            {
              id: `notif_${Date.now()}`,
              userId: currentUser.id,
              title: 'Spot Opened Up!',
              message: `You were automatically promoted from the waitlist for "${act.title}"!`,
              type: 'waitlist',
              activityId: act.id,
              timestamp: 'Just now',
              read: false
            },
            ...nPrev
          ]);
        }
      }

      return {
        ...act,
        participants: finalParticipants,
        waitlist: finalWaitlist
      };
    }));

    sendChatMessage(activityId, `🚶 ${currentUser.name} left the hangout.`);
  };

  const sendChatMessage = (activityId: string, text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      activityId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [activityId]: [...(prev[activityId] || []), newMsg]
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const verifyUserPhoneAndId = () => {
    setCurrentUser(prev => ({
      ...prev,
      verified: true,
      phoneVerified: true
    }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, verified: true, phoneVerified: true } : u));
    setIsVerificationModalOpen(false);
  };

  const reportItem = (targetType: 'user' | 'activity', targetId: string, reason: string) => {
    alert(`Thank you. Your report for ${targetType} #${targetId} (Reason: ${reason}) has been logged for community safety review.`);
  };

  const blockUser = (targetUserId: string) => {
    setBlockedUsers(prev => [...prev, targetUserId]);
    alert(`User has been blocked. You will no longer see their activities.`);
  };

  const addHostReview = (hostId: string, activityId: string, rating: number, comment: string) => {
    const newRev: HostReview = {
      id: `rev_${Date.now()}`,
      activityId,
      hostId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      rating,
      comment,
      timestamp: 'Just now'
    };
    
    setReviews(prev => [newRev, ...prev]);

    // Recalculate host average rating dynamically
    const allHostRevs = [...reviews.filter(r => r.hostId === hostId), newRev];
    const avgRating = allHostRevs.reduce((acc, r) => acc + r.rating, 0) / allHostRevs.length;

    setActivities(prev => prev.map(a => a.hostId === hostId ? { ...a, hostRating: Math.round(avgRating * 10) / 10 } : a));
    setAllUsers(prev => prev.map(u => u.id === hostId ? { ...u, rating: Math.round(avgRating * 10) / 10, reviewsCount: allHostRevs.length } : u));
  };

  const updateUserProfile = (updatedFields: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedFields } : u));
  };

  const deleteUserProfile = (userId: string) => {
    const remainingUsers = allUsers.filter(u => u.id !== userId);
    setAllUsers(remainingUsers);

    setActivities(prev => 
      prev
        .filter(act => act.hostId !== userId)
        .map(act => ({
          ...act,
          participants: act.participants.filter(p => p.userId !== userId),
          waitlist: act.waitlist.filter(p => p.userId !== userId)
        }))
    );

    setReviews(prev => prev.filter(r => r.hostId !== userId && r.reviewerId !== userId));

    if (currentUser.id === userId) {
      if (remainingUsers.length > 0) {
        setCurrentUser(remainingUsers[0]);
      } else {
        const freshUser: User = {
          id: 'usr_me',
          name: 'New User',
          email: 'user@pulsemeet.app',
          bio: '',
          avatar: getRandomAvatar(),
          interests: [],
          verified: false,
          phoneVerified: false,
          rating: 5.0,
          reviewsCount: 0,
          activitiesHostedCount: 0,
          activitiesJoinedCount: 0,
          joinedDate: 'Today'
        };
        setCurrentUser(freshUser);
      }
    }
  };

  // Compute dynamic distance for every activity based on active user location & apply multi-filter engine
  const activitiesWithDynamicDistance = activities.map(act => {
    const dist = calculateHaversineKm(userLocation.lat, userLocation.lng, act.lat, act.lng);
    return {
      ...act,
      distanceKm: dist
    };
  });

  const filteredActivities = activitiesWithDynamicDistance.filter(act => {
    if (blockedUsers.includes(act.hostId)) return false;

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchCat = act.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      if (!filters.selectedCategories.includes(act.category)) return false;
    }

    // Distance filter
    if (act.distanceKm && act.distanceKm > filters.maxDistanceKm) {
      return false;
    }

    // Capacity filter
    if (filters.onlyAvailable && act.maxParticipants) {
      if (act.participants.length >= act.maxParticipants) return false;
    }

    return true;
  });

  // Dynamic sorting engine
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (filters.sortBy === 'distance') {
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    }
    if (filters.sortBy === 'popular') {
      return b.participants.length - a.participants.length;
    }
    // Default 'soonest'
    return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
  });

  return (
    <AppContext.Provider value={{
      currentUser,
      allUsers,
      activities: sortedActivities,
      chatMessages,
      notifications,
      reviews,
      filters,
      selectedActivityId,
      isCreateModalOpen,
      isSafetyModalOpen,
      isVerificationModalOpen,
      isNotificationDrawerOpen,
      userLocation,
      theme,
      toggleTheme,
      setFilters,
      setSelectedActivityId,
      setIsCreateModalOpen,
      setIsSafetyModalOpen,
      setIsVerificationModalOpen,
      setIsNotificationDrawerOpen,
      setUserLocation,
      switchUser,
      createCustomUser,
      createActivity,
      joinActivity,
      leaveActivity,
      sendChatMessage,
      markNotificationAsRead,
      clearAllNotifications,
      verifyUserPhoneAndId,
      reportItem,
      blockUser,
      addHostReview,
      updateUserProfile,
      deleteUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
