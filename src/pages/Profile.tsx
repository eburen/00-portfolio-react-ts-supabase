import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
    const { profile, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateProfile({ full_name: fullName, address, phone });
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>

            <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
                {isEditing ? (
                    <form onSubmit={handleSaveChanges}>
                        <div className="mb-4">
                            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                rows={3}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-gray-900">{profile?.email}</p>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-gray-900">{profile?.address || 'Not provided'}</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                            <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile; 