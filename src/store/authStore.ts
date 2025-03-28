import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import * as authApi from '@/api/auth';

interface AuthState {
    user: User | null;
    profile: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Actions
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName?: string, address?: string, phone?: string) => Promise<void>;
    signOut: () => Promise<void>;
    setUser: (user: User | null) => void;
    updateProfile: (updates: { full_name?: string; address?: string; phone?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,

    initialize: async () => {
        try {
            const session = await authApi.getSession();
            if (session) {
                const user = session.user;
                const profile = await authApi.getUserProfile(user.id);
                set({
                    user,
                    profile,
                    isAuthenticated: true,
                    isAdmin: profile?.role === 'admin',
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
            set({ isLoading: false });
        }
    },

    signIn: async (email: string, password: string) => {
        try {
            set({ isLoading: true });
            const { user, session } = await authApi.signIn({ email, password });

            if (user) {
                const profile = await authApi.getUserProfile(user.id);
                set({
                    user,
                    profile,
                    isAuthenticated: true,
                    isAdmin: profile?.role === 'admin',
                    isLoading: false
                });
            }
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    signUp: async (email: string, password: string, fullName?: string, address?: string, phone?: string) => {
        try {
            set({ isLoading: true });
            await authApi.signUp({
                email,
                password,
                full_name: fullName,
                address,
                phone
            });
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    signOut: async () => {
        try {
            set({ isLoading: true });
            await authApi.signOut();
            set({
                user: null,
                profile: null,
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    setUser: (user: User | null) => {
        set({ user });
    },

    updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        try {
            set({ isLoading: true });
            const updatedProfile = await authApi.updateUserProfile(user.id, updates);
            set({ profile: updatedProfile, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    }
})); 