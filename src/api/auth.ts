import supabase from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export type SignUpCredentials = {
    email: string;
    password: string;
    full_name?: string;
    address?: string;
    phone?: string;
};

export type SignInCredentials = {
    email: string;
    password: string;
};

export const signUp = async ({ email, password, full_name, address, phone }: SignUpCredentials) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    // Create profile for the user
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            full_name,
            address,
            phone,
            role: 'customer', // Default role
        });
    }

    return data;
};

export const signIn = async ({ email, password }: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }

    return null;
};

export const getSession = async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session;
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return data.user;
};

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const updateUserProfile = async (userId: string, updates: {
    full_name?: string;
    address?: string;
    phone?: string;
}) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}; 