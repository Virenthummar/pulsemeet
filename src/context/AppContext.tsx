import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
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
  createCustomUser: (name: string, bio: string, interestsStr: string, customAvatar?: string, customEmail?: string) => void;
  createActivity: (newActData: Omit<Activity, 'id' | 'hostId' | 'hostName' | 'hostAvatar' | 'hostVerified' | 'hostRating' | 'participants' | 'waitlist' | 'createdAt' | 'status'>) => void;
  joinActivity: (activityId: string) => void;
  leaveActivity: (activityId: string) => void;
  deleteActivity: (activityId: string) => void;
  editActivity: (activityId: string, updatedFields: Partial<Activity>) => void;
  sendChatMessage: (activityId: string, text: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  verifyUserPhoneAndId: () => void;
  reportItem: (targetType: 'user' | 'activity', targetId: string, reason: string) => void;
  blockUser: (targetUserId: string) => void;
  addHostReview: (hostId: string, activityId: string, rating: number, comment: string) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
  deleteUserProfile: (userId: string) => void;
  connections: string[];
  submitHangoutSignal: (toUserId: string, activityId: string, wantsAgain: boolean) => Promise<boolean>;
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
  // Track recently mutated activity IDs to prevent MongoDB poll from overwriting local changes
  const recentlyMutatedIds = useRef<Map<string, number>>(new Map());

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_user');
    if (saved) return JSON.parse(saved);

    // Generate a truly unique mock user ID for each new device/browser
    const freshId = `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const freshUser = { ...MOCK_USERS[0], id: freshId };
    
    // Auto-save the new unique user so it persists
    localStorage.setItem(LOCAL_STORAGE_KEY + '_user', JSON.stringify(freshUser));
    return freshUser;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_activities');
    return saved ? JSON.parse(saved) : MOCK_ACTIVITIES;
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_chats');
    return saved ? JSON.parse(saved) : MOCK_CHAT_MESSAGES;
  });

  const [connections, setConnections] = useState<string[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [reviews, setReviews] = useState<HostReview[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_user_location');
    return saved ? JSON.parse(saved) : {
      lat: 23.0225,
      lng: 72.5714,
      label: 'Ahmedabad, Gujarat'
    };
  });

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    maxDistanceKm: 50, // 50 = 50+ km (Unlimited)
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
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_user_location', JSON.stringify(userLocation));
    // Update currentUser with new lat/lng which will trigger the currentUser effect to save to MongoDB
    if (currentUser && currentUser.id) {
      setCurrentUser(prev => ({
        ...prev,
        lat: userLocation.lat,
        lng: userLocation.lng
      }));
    }
  }, [userLocation]);

const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

  // Helper to push state updates to MongoDB Database
  const syncToCloud = async (dataToPush: any) => {
    try {
      if (!dataToPush) return;

      // Save activities to MongoDB Database Backend
      if (dataToPush.activities && dataToPush.activities.length > 0) {
        dataToPush.activities.slice(0, 3).forEach((act: Activity) => {
          fetch(`${API_BASE_URL}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(act)
          }).catch(() => {});
        });
      }
    } catch (err) {
      console.warn('Sync warning:', err);
    }
  };

  // Sync state to local storage
  useEffect(() => {
    setAllUsers(prev => {
      if (!prev.some(u => u.id === currentUser.id)) {
        return [...prev, currentUser];
      }
      return prev;
    });
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_user', JSON.stringify(currentUser));
    // Persist current user to MongoDB
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUser)
    }).catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Real-Time Cross-Device Sync Polling from MongoDB (Every 3 seconds)
  useEffect(() => {
    const fetchFromMongoDB = async () => {
      try {
        const mongoRes = await fetch(`${API_BASE_URL}/activities`).catch(() => null);
        if (mongoRes && mongoRes.ok) {
          const mongoData = await mongoRes.json();
          if (Array.isArray(mongoData) && mongoData.length > 0) {
            const normalizedActs: Activity[] = mongoData
              .filter((act: any) => act && act.id && act.title)
              .map((act: any) => ({
                id: act.id,
                hostId: act.hostId || '',
                hostName: act.hostName || 'Anonymous',
                hostAvatar: act.hostAvatar || '',
                hostVerified: act.hostVerified ?? false,
                hostRating: act.hostRating ?? 5,
                title: act.title,
                category: act.category || 'Other',
                description: act.description || '',
                datetime: act.datetime || new Date().toISOString(),
                lat: typeof act.lat === 'number' ? act.lat : 0,
                lng: typeof act.lng === 'number' ? act.lng : 0,
                address: act.address || '',
                approxLocation: act.approxLocation || '',
                exactMeetingPoint: act.exactMeetingPoint || '',
                maxParticipants: act.maxParticipants,
                participants: Array.isArray(act.participants) ? act.participants : [],
                waitlist: Array.isArray(act.waitlist) ? act.waitlist : [],
                visibility: act.visibility || 'public',
                requiresApproval: act.requiresApproval ?? false,
                coverImage: act.coverImage || '',
                status: act.status || 'upcoming',
                createdAt: act.createdAt || new Date().toISOString(),
                weather: act.weather
              }));

            if (normalizedActs.length > 0) {
              setActivities(prevLocal => {
                const prevMap = new Map<string, Activity>(prevLocal.map(a => [a.id, a]));
                const now = Date.now();

                const merged = normalizedActs.map(mongoAct => {
                  const localAct = prevMap.get(mongoAct.id);
                  if (!localAct) return mongoAct;

                  const mutatedAt = recentlyMutatedIds.current.get(mongoAct.id);
                  if (mutatedAt && now - mutatedAt < 30000) {
                    // Local version is fresher — preserve user actions
                    return localAct;
                  }

                  // Check if currentUser joined locally
                  const localJoinedUser = localAct.participants.find(p => p.userId === currentUser.id);
                  const mongoHasUser = mongoAct.participants.some(p => p.userId === currentUser.id);

                  if (localJoinedUser && !mongoHasUser) {
                    // Preserve local user participant state so polling never kicks them out!
                    return {
                      ...mongoAct,
                      participants: [...mongoAct.participants, localJoinedUser]
                    };
                  }

                  return mongoAct;
                });

                // Retain any activities created locally that aren't in MongoDB yet
                prevLocal.forEach(localAct => {
                  if (!merged.some(m => m.id === localAct.id)) {
                    merged.push(localAct);
                  }
                });

                return merged;
              });
            }
          }
        }
        
        // Fetch connections
        const connRes = await fetch(`${API_BASE_URL}/connections/${currentUser.id}`).catch(() => null);
        if (connRes && connRes.ok) {
          const freshConnections: string[] = await connRes.json();
          setConnections(prev => {
            // Find newly matched connections to trigger local notifications
            const newConns = freshConnections.filter(c => !prev.includes(c));
            if (newConns.length > 0) {
              setNotifications(nPrev => {
                const newNotifs = newConns.map(cId => {
                  const user = allUsers.find(u => u.id === cId) || { name: 'Someone' };
                  return {
                    id: `notif_match_${cId}_${Date.now()}`,
                    userId: currentUser.id,
                    title: 'New Connection!',
                    message: `You and ${user.name} both want to hang out again!`,
                    type: 'match' as const,
                    timestamp: 'Just now',
                    read: false
                  };
                });
                return [...newNotifs, ...nPrev];
              });
            }
            return freshConnections;
          });
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    };

    fetchFromMongoDB();
    const interval = setInterval(fetchFromMongoDB, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Browser Geolocation (Only run if user hasn't explicitly chosen a location preset)
  useEffect(() => {
    const savedLoc = localStorage.getItem(LOCAL_STORAGE_KEY + '_user_location');
    if (!savedLoc && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your Current GPS Location'
          });
        },
        () => {}
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
  const createCustomUser = (name: string, bio: string, interestsStr: string, customAvatar?: string, customEmail?: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'New Explorer',
      email: customEmail?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
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

    const updatedActivities = [newActivity, ...activities];
    const updatedChats = {
      ...chatMessages,
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
    };

    setActivities(updatedActivities);
    
    // Dynamically update user stats
    setCurrentUser(prev => ({
      ...prev,
      activitiesHostedCount: prev.activitiesHostedCount + 1
    }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, activitiesHostedCount: u.activitiesHostedCount + 1 } : u));

    // Dynamic initial welcome chat message
    setChatMessages(updatedChats);

    // Instant multi-device cloud broadcast
    syncToCloud({
      activities: updatedActivities,
      chatMessages: updatedChats,
      reviews,
      allUsers
    });

    setIsCreateModalOpen(false);
    setSelectedActivityId(newActivity.id);
  };

  const joinActivity = (activityId: string) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;
    
    const alreadyJoined = act.participants.some(p => p.userId === currentUser.id);
    if (alreadyJoined) return;

    const isFull = act.maxParticipants ? act.participants.length >= act.maxParticipants : false;

    const newParticipant = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      isVerified: currentUser.verified,
      joinedAt: new Date().toISOString(),
      status: isFull ? ('waitlisted' as const) : ('confirmed' as const)
    };

    let updatedActivity: Activity;
    if (isFull) {
      updatedActivity = { ...act, waitlist: [...act.waitlist, newParticipant] };
    } else {
      updatedActivity = { ...act, participants: [...act.participants, newParticipant] };
    }

    setActivities(prev => prev.map(a => a.id === activityId ? updatedActivity : a));

    // Persist join to MongoDB (both POST upsert and PUT for max reliability)
    recentlyMutatedIds.current.set(activityId, Date.now());
    fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity)
    }).catch(() => {});
    fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity)
    }).catch(() => {});

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
    const act = activities.find(a => a.id === activityId);
    if (!act) return;

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

    const updatedActivity = {
      ...act,
      participants: finalParticipants,
      waitlist: finalWaitlist
    };

    setActivities(prev => prev.map(a => a.id === activityId ? updatedActivity : a));

    // Persist leave to MongoDB
    recentlyMutatedIds.current.set(activityId, Date.now());
    fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity)
    }).catch(() => {});

    sendChatMessage(activityId, `🚶 ${currentUser.name} left the hangout.`);
  };

  // Delete activity (host only — UI enforces this)
  const deleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(act => act.id !== activityId));
    setSelectedActivityId(null);

    // Remove from MongoDB
    recentlyMutatedIds.current.set(activityId, Date.now());
    fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'DELETE'
    }).catch(() => {});

    // Clean up chat messages for this activity
    setChatMessages(prev => {
      const updated = { ...prev };
      delete updated[activityId];
      return updated;
    });
  };

  // Edit activity (host only — UI enforces this)
  const editActivity = (activityId: string, updatedFields: Partial<Activity>) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;
    
    const updatedActivity = { ...act, ...updatedFields };

    setActivities(prev => prev.map(a => a.id === activityId ? updatedActivity : a));

    // Persist to MongoDB
    recentlyMutatedIds.current.set(activityId, Date.now());
    fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity)
    }).catch(() => {});
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

    setChatMessages(prev => {
      const updated = {
        ...prev,
        [activityId]: [...(prev[activityId] || []), newMsg]
      };
      syncToCloud({
        activities,
        chatMessages: updated,
        reviews,
        allUsers
      });
      return updated;
    });
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
          id: `usr_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
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

  const submitHangoutSignal = async (toUserId: string, activityId: string, wantsAgain: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/hangout-signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `sig_${currentUser.id}_${toUserId}_${activityId}`,
          fromUserId: currentUser.id,
          toUserId,
          activityId,
          wantsAgain,
          createdAt: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.isMatch) {
        // We matched! Update local connections immediately so we don't have to wait for the poll
        setConnections(prev => {
          if (!prev.includes(toUserId)) return [...prev, toUserId];
          return prev;
        });
        
        const matchedUser = allUsers.find(u => u.id === toUserId) || { name: 'Someone' };
        setNotifications(prev => [
          {
            id: `notif_match_${toUserId}_${Date.now()}`,
            userId: currentUser.id,
            title: 'New Connection!',
            message: `You and ${matchedUser.name} both want to hang out again!`,
            type: 'match',
            timestamp: 'Just now',
            read: false
          },
          ...prev
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error submitting signal', err);
      return false;
    }
  };

  const filteredActivities = activitiesWithDynamicDistance.filter(act => {
    if (blockedUsers.includes(act.hostId)) return false;

    // City filter — only show activities matching the user's selected city
    // Extract city name from label like "Anand, Gujarat" → "Anand"
    const selectedLabel = userLocation.label || '';
    const isGPSLocation = selectedLabel === 'Your Current GPS Location' || selectedLabel === '';
    if (!isGPSLocation && selectedLabel) {
      const cityName = selectedLabel.split(',')[0].trim().toLowerCase();
      const actAddress = (act.address || '').toLowerCase();
      const actApproxLoc = (act.approxLocation || '').toLowerCase();
      // Show activity only if it belongs to the selected city
      if (!actAddress.includes(cityName) && !actApproxLoc.includes(cityName)) {
        return false;
      }
    }

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

    // Distance filter (50 means 50+ km / unlimited)
    if (filters.maxDistanceKm > 0 && filters.maxDistanceKm < 50 && act.distanceKm !== undefined && act.distanceKm > filters.maxDistanceKm) {
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
    // Default 'soonest' — nearest time first, then nearest distance
    const timeDiff = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    if (timeDiff !== 0) return timeDiff;
    return (a.distanceKm || 0) - (b.distanceKm || 0);
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
      isEditProfileModalOpen,
      setIsEditProfileModalOpen,
      setUserLocation,
      switchUser,
      createCustomUser,
      createActivity,
      joinActivity,
      leaveActivity,
      deleteActivity,
      editActivity,
      sendChatMessage,
      markNotificationAsRead,
      clearAllNotifications,
      verifyUserPhoneAndId,
      reportItem,
      blockUser,
      addHostReview,
      updateUserProfile,
      deleteUserProfile,
      connections,
      submitHangoutSignal
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
