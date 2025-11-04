"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { useState, useEffect } from "react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/profile", name: "Profile" },
];

interface User {
  id?: number; // Make id optional
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Address {
  id: number;
  title: string;
  type: "billing" | "shipping";
  is_default: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

interface ApiResponse {
  success: number;
  detail: string;
  data: any;
  total?: number;
}

// Utility function to get access token from cookies
const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Get user from localStorage
const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// API client with authorization
const apiClient = {
  async get(url: string) {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async post(url: string, data: any) {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async put(url: string, data: any) {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async delete(url: string) {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [addressForm, setAddressForm] = useState({
    id: null as number | null,
    title: "",
    type: "shipping" as "billing" | "shipping",
    is_default: false,
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
    location: {
      lat: 0,
      lng: 0,
    },
  });

  useEffect(() => {
    loadUserData();
    loadAddresses();
  }, []);

  const loadUserData = () => {
    const userData = getUserFromStorage();
    if (userData) {
      setUser(userData);
      setProfileForm({
        name: userData.name,
        phone: userData.phone || "",
      });
    }
    setLoading(false);
  };

  const loadAddresses = async () => {
    try {
      const userData = getUserFromStorage();
      if (!userData) return;

      const data: ApiResponse = await apiClient.get(
        `https://api.ctspk.com/address/list?user=${userData.id}&page=1&skip=0&limit=10`
      );
      
      if (data.success === 1) {
        setAddresses(data.data || []);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setError(null);
    setSuccess(null);

    const response: ApiResponse = await apiClient.put(
      "https://api.ctspk.com/user/profile",
      profileForm
    );

    if (response.success === 1) {
      // Update localStorage
      const updatedUser = { 
        ...user, 
        ...profileForm,
        id: user?.id || 0, // Ensure id is always defined
        email: user?.email || "" // Ensure email is always defined
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser as User); // Explicitly cast to User type
      setSuccess("Profile updated successfully!");
    } else {
      throw new Error(response.detail || 'Failed to update profile');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update profile');
  }
};

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        setError("New passwords do not match");
        return;
      }

      const response: ApiResponse = await apiClient.put(
        "https://api.ctspk.com/user/change-password",
        passwordForm
      );

      if (response.success === 1) {
        setSuccess("Password changed successfully!");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        throw new Error(response.detail || 'Failed to change password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      let response: ApiResponse;
      
      if (addressForm.id) {
        // Update existing address
        response = await apiClient.put(
          `https://api.ctspk.com/address/update/${addressForm.id}`,
          addressForm
        );
      } else {
        // Create new address
        response = await apiClient.post(
          "https://api.ctspk.com/address/create",
          addressForm
        );
      }

      if (response.success === 1) {
        setSuccess(`Address ${addressForm.id ? 'updated' : 'added'} successfully!`);
        resetAddressForm();
        await loadAddresses();
      } else {
        throw new Error(response.detail || `Failed to ${addressForm.id ? 'update' : 'add'} address`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${addressForm.id ? 'update' : 'add'} address`);
    }
  };

  const deleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setError(null);
      const response: ApiResponse = await apiClient.delete(
        `https://api.ctspk.com/address/delete/${addressId}`
      );

      if (response.success === 1) {
        setSuccess("Address deleted successfully!");
        await loadAddresses();
      } else {
        throw new Error(response.detail || 'Failed to delete address');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const editAddress = (address: Address) => {
    setAddressForm({
      id: address.id,
      title: address.title,
      type: address.type,
      is_default: address.is_default,
      address: { ...address.address },
      location: { ...address.location },
    });
  };

  const resetAddressForm = () => {
    setAddressForm({
      id: null,
      title: "",
      type: "shipping",
      is_default: false,
      address: {
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      },
      location: {
        lat: 0,
        lng: 0,
      },
    });
  };

  const setDefaultAddress = async (addressId: number, type: "billing" | "shipping") => {
    try {
      const address = addresses.find(addr => addr.id === addressId);
      if (!address) return;

      const response: ApiResponse = await apiClient.put(
        `https://api.ctspk.com/address/update/${addressId}`,
        {
          ...address,
          is_default: true,
          type: type,
        }
      );

      if (response.success === 1) {
        setSuccess("Default address updated successfully!");
        await loadAddresses();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update default address');
    }
  };

  if (loading) {
    return (
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-6" />
        <LayoutSkeleton />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <BreadcrumbSimple data={breadcrumbData} className="py-6" />
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-8">Please log in to view your profile.</p>
          <Button asChild>
            <a href="/login">Login</a>
          </Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 mb-8">Manage your account information and addresses</p>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile Info</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            {/* Profile Info Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button type="submit">Update Profile</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Change Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={changePassword} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                          id="current_password"
                          type="password"
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="new_password">New Password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit">Change Password</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Address Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {addressForm.id ? 'Edit Address' : 'Add New Address'}
                    </CardTitle>
                    <CardDescription>
                      {addressForm.id ? 'Update your address information' : 'Add a new shipping or billing address'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveAddress} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Address Title</Label>
                        <Input
                          id="title"
                          value={addressForm.title}
                          onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                          placeholder="e.g., Home, Office"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="type">Address Type</Label>
                        <select
                          id="type"
                          value={addressForm.type}
                          onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as "billing" | "shipping" })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="shipping">Shipping</option>
                          <option value="billing">Billing</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={addressForm.address.street}
                            onChange={(e) => setAddressForm({
                              ...addressForm,
                              address: { ...addressForm.address, street: e.target.value }
                            })}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={addressForm.address.city}
                              onChange={(e) => setAddressForm({
                                ...addressForm,
                                address: { ...addressForm.address, city: e.target.value }
                              })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={addressForm.address.state}
                              onChange={(e) => setAddressForm({
                                ...addressForm,
                                address: { ...addressForm.address, state: e.target.value }
                              })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                              id="postal_code"
                              value={addressForm.address.postal_code}
                              onChange={(e) => setAddressForm({
                                ...addressForm,
                                address: { ...addressForm.address, postal_code: e.target.value }
                              })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={addressForm.address.country}
                              onChange={(e) => setAddressForm({
                                ...addressForm,
                                address: { ...addressForm.address, country: e.target.value }
                              })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_default">Set as default {addressForm.type} address</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">
                          {addressForm.id ? 'Update Address' : 'Add Address'}
                        </Button>
                        {addressForm.id && (
                          <Button type="button" variant="outline" onClick={resetAddressForm}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Address List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>
                      Manage your shipping and billing addresses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {addresses.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
                      ) : (
                        addresses.map((address) => (
                          <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{address.title}</h4>
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                  address.type === 'shipping' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {address.type}
                                </span>
                                {address.is_default && (
                                  <span className="ml-2 inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editAddress(address)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteAddress(address.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.address.street}, {address.address.city}<br />
                              {address.address.state}, {address.address.postal_code}<br />
                              {address.address.country}
                            </p>
                            {!address.is_default && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDefaultAddress(address.id, address.type)}
                                className="mt-2 text-xs"
                              >
                                Set as Default
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Screen>
  );
};

export default ProfilePage;