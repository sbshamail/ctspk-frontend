"use client";

import { Screen } from "@/@core/layout";
import { BreadcrumbSimple } from "@/components/breadCrumb/BreadcrumbSimple";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import LayoutSkeleton from "@/components/loaders/LayoutSkeleton";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSelection } from "@/lib/useSelection";
import Image from "next/image";
import {
  Store, Upload, MapPin, Phone, Globe, Facebook, Instagram,
  Twitter, Youtube, Plus, Trash2, ImageIcon, X, Search, Loader2
} from "lucide-react";

const breadcrumbData = [
  { link: "/", name: "Home" },
  { link: "/become-seller", name: "Become a Seller" },
];

// Interfaces
interface MediaImage {
  id: number;
  size_mb: number;
  filename: string;
  original: string;
  extension: string;
  thumbnail: string | null;
  media_type: string;
}

interface ShopAddress {
  zip: string;
  area: string;
  city: string;
  state: string;
  country: string;
  street_address: string;
}

interface ShopSettings {
  contact: string;
  socials: Array<{
    facebook: string;
    youtube: string;
    twitter: string;
    instagram: string;
  }>;
  website: string;
  location: Array<{
    lat: string;
    lng: string;
  }>;
  notifications: Array<{
    is_active: boolean;
  }>;
}

interface Shop {
  id: number;
  name: string;
  description: string;
  logo: MediaImage | null;
  cover_image: MediaImage | null;
  address: ShopAddress;
  settings: ShopSettings;
  is_active: boolean;
  created_at: string;
}

interface ShopFormData {
  name: string;
  description: string;
  logo: MediaImage | null;
  cover_image: MediaImage | null;
  address: ShopAddress;
  settings: ShopSettings;
  notifications: Record<string, any>;
}

// Utility functions
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

const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const formattedBaseUrl = baseUrl.replace(/\/$/, '');
  const formattedEndpoint = endpoint.replace(/^\//, '');
  return `${formattedBaseUrl}/${formattedEndpoint}`;
};

// Phone validation: country code + 10 digits (e.g., +923001234567)
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
};

const BecomeSellerPage = () => {
  const { data: auth, isLoading: authLoading } = useSelection("auth");
  const user = auth?.user;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Google Maps
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ShopFormData>({
    name: "",
    description: "",
    logo: null,
    cover_image: null,
    address: {
      zip: "",
      area: "",
      city: "",
      state: "",
      country: "Pakistan",
      street_address: "",
    },
    settings: {
      contact: "+92",
      socials: [{ facebook: "", youtube: "", twitter: "", instagram: "" }],
      website: "",
      location: [{ lat: "", lng: "" }],
      notifications: [{ is_active: true }],
    },
    notifications: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load shops and Google API key
  useEffect(() => {
    if (user) {
      loadShops();
      loadGoogleApiKey();
    }
    setLoading(false);
  }, [user]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadGoogleApiKey = async () => {
    // Check environment variable for Google Maps API key
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      setGoogleApiKey(key);
    }
  };

  const loadShops = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(getApiUrl('/shop/my-shops'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setShops(Array.isArray(result.data) ? result.data : [result.data]);
        }
      }
    } catch (error) {
      console.error("Error loading shops:", error);
    }
  };

  // Image upload handler
  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'cover_image'
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);

    try {
      const token = getAccessToken();
      const formDataUpload = new FormData();
      formDataUpload.append('files', file);

      const response = await fetch(getApiUrl('/media/create?thumbnail=true'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const uploadedImage = result.data[0];
        setFormData(prev => ({
          ...prev,
          [type]: uploadedImage,
        }));
        toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully`);
      }
    } catch (error) {
      toast.error(`Failed to upload ${type === 'logo' ? 'logo' : 'cover image'}`);
    } finally {
      setUploading(false);
    }
  };

  // Google Places Autocomplete
  const searchAddress = useCallback(async (query: string) => {
    if (!googleApiKey || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}&types=address`
      );
      const data = await response.json();

      if (data.predictions) {
        setAddressSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setSearchingAddress(false);
    }
  }, [googleApiKey]);

  // Get place details from Google
  const getPlaceDetails = async (placeId: string) => {
    if (!googleApiKey) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleApiKey}&fields=address_components,geometry`
      );
      const data = await response.json();

      if (data.result) {
        const { address_components, geometry } = data.result;

        const getComponent = (type: string) => {
          const component = address_components?.find((c: any) => c.types.includes(type));
          return component?.long_name || "";
        };

        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street_address: `${getComponent('street_number')} ${getComponent('route')}`.trim(),
            area: getComponent('sublocality') || getComponent('neighborhood'),
            city: getComponent('locality'),
            state: getComponent('administrative_area_level_1'),
            country: getComponent('country'),
            zip: getComponent('postal_code'),
          },
          settings: {
            ...prev.settings,
            location: [{
              lat: geometry?.location?.lat?.toString() || "",
              lng: geometry?.location?.lng?.toString() || "",
            }],
          },
        }));

        setShowSuggestions(false);
        toast.success("Address filled from Google Maps");
      }
    } catch (error) {
      console.error("Error getting place details:", error);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Shop name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.logo) {
      newErrors.logo = "Logo is required";
    }

    if (!formData.cover_image) {
      newErrors.cover_image = "Cover image is required";
    }

    if (!formData.settings.contact || !validatePhone(formData.settings.contact)) {
      newErrors.contact = "Valid phone number required (e.g., +923001234567)";
    }

    if (!formData.settings.location[0]?.lat || !formData.settings.location[0]?.lng) {
      newErrors.location = "Location coordinates are required";
    }

    if (!formData.address.street_address.trim()) {
      newErrors.street_address = "Street address is required";
    }

    if (!formData.address.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setSubmitting(true);

    try {
      const token = getAccessToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(getApiUrl('/shop/create'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Shop created successfully!");
        resetForm();
        loadShops();
      } else {
        throw new Error(result.detail || "Failed to create shop");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create shop");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      logo: null,
      cover_image: null,
      address: {
        zip: "",
        area: "",
        city: "",
        state: "",
        country: "Pakistan",
        street_address: "",
      },
      settings: {
        contact: "+92",
        socials: [{ facebook: "", youtube: "", twitter: "", instagram: "" }],
        website: "",
        location: [{ lat: "", lng: "" }],
        notifications: [{ is_active: true }],
      },
      notifications: {},
    });
    setErrors({});
  };

  if (loading || authLoading) {
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
          <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-8">Please log in to become a seller.</p>
          <Button asChild>
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <BreadcrumbSimple data={breadcrumbData} className="py-6" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Seller</h1>
            <p className="text-gray-600">Create your shop and start selling your products</p>
          </div>

          {/* Existing Shops */}
          {shops.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Shops</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden">
                    <div className="relative h-32">
                      {shop.cover_image?.original ? (
                        <Image
                          src={shop.cover_image.original}
                          alt={shop.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40" />
                      )}
                      <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                        <div className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                          {shop.logo?.original ? (
                            <Image
                              src={shop.logo.original}
                              alt={shop.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Store className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-10 pb-4">
                      <h3 className="font-semibold text-lg">{shop.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.address?.city}, {shop.address?.country}</span>
                      </div>
                      <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        shop.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {shop.is_active ? 'Active' : 'Pending Approval'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Create Shop Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Shop
              </CardTitle>
              <CardDescription>
                Fill in the details to create your new shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="name">Shop Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your shop name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your shop and what you sell"
                        rows={4}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">Shop Images</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <Label>Shop Logo *</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                          accept="image/*"
                          className="hidden"
                        />
                        {formData.logo ? (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                            <Image
                              src={formData.logo.original}
                              alt="Logo"
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, logo: null })}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className={`w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors ${
                              errors.logo ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            {uploadingLogo ? (
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            ) : (
                              <>
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                <span className="text-sm text-gray-500">Upload Logo</span>
                              </>
                            )}
                          </button>
                        )}
                        {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                      <Label>Cover Image *</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          ref={coverInputRef}
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover_image')}
                          accept="image/*"
                          className="hidden"
                        />
                        {formData.cover_image ? (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                            <Image
                              src={formData.cover_image.original}
                              alt="Cover"
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, cover_image: null })}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingCover}
                            className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors ${
                              errors.cover_image ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            {uploadingCover ? (
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-sm text-gray-500">Upload Cover Image</span>
                              </>
                            )}
                          </button>
                        )}
                        {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">Shop Address</h3>

                  {/* Google Maps Search */}
                  {googleApiKey && (
                    <div className="relative">
                      <Label>Search Address (Google Maps)</Label>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Search for your shop address..."
                          className="pl-10"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length >= 3) {
                              searchAddress(value);
                            } else {
                              setAddressSuggestions([]);
                            }
                          }}
                        />
                        {searchingAddress && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>

                      {/* Suggestions Dropdown */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {addressSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              type="button"
                              onClick={() => getPlaceDetails(suggestion.place_id)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b last:border-b-0"
                            >
                              <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">{suggestion.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street_address">Street Address *</Label>
                      <Input
                        id="street_address"
                        value={formData.address.street_address}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street_address: e.target.value }
                        })}
                        placeholder="Enter street address"
                        className={errors.street_address ? "border-red-500" : ""}
                      />
                      {errors.street_address && <p className="text-red-500 text-sm mt-1">{errors.street_address}</p>}
                    </div>

                    <div>
                      <Label htmlFor="area">Area</Label>
                      <Input
                        id="area"
                        value={formData.address.area}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, area: e.target.value }
                        })}
                        placeholder="Enter area/neighborhood"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })}
                        placeholder="Enter city"
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={formData.address.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value }
                        })}
                        placeholder="Enter state/province"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.address.country}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value }
                        })}
                        placeholder="Enter country"
                      />
                    </div>

                    <div>
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input
                        id="zip"
                        value={formData.address.zip}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, zip: e.target.value }
                        })}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>

                  {/* Location Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude *</Label>
                      <Input
                        id="lat"
                        value={formData.settings.location[0]?.lat || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            location: [{ ...formData.settings.location[0], lat: e.target.value }]
                          }
                        })}
                        placeholder="e.g., 33.6844"
                        className={errors.location ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude *</Label>
                      <Input
                        id="lng"
                        value={formData.settings.location[0]?.lng || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            location: [{ ...formData.settings.location[0], lng: e.target.value }]
                          }
                        })}
                        placeholder="e.g., 73.0479"
                        className={errors.location ? "border-red-500" : ""}
                      />
                    </div>
                    {errors.location && <p className="text-red-500 text-sm col-span-2">{errors.location}</p>}
                  </div>
                </div>

                {/* Contact & Settings Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">Contact & Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="contact"
                          value={formData.settings.contact}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, contact: e.target.value }
                          })}
                          placeholder="+923001234567"
                          className={`pl-10 ${errors.contact ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                      <p className="text-xs text-gray-500 mt-1">Format: +country code + 10 digits</p>
                    </div>

                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="website"
                          value={formData.settings.website}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings, website: e.target.value }
                          })}
                          placeholder="https://yourwebsite.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <Label className="mb-3 block">Social Media Links (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                        <Input
                          value={formData.settings.socials[0]?.facebook || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              socials: [{ ...formData.settings.socials[0], facebook: e.target.value }]
                            }
                          })}
                          placeholder="Facebook URL"
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
                        <Input
                          value={formData.settings.socials[0]?.instagram || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              socials: [{ ...formData.settings.socials[0], instagram: e.target.value }]
                            }
                          })}
                          placeholder="Instagram URL"
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                        <Input
                          value={formData.settings.socials[0]?.twitter || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              socials: [{ ...formData.settings.socials[0], twitter: e.target.value }]
                            }
                          })}
                          placeholder="Twitter URL"
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                        <Input
                          value={formData.settings.socials[0]?.youtube || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              socials: [{ ...formData.settings.socials[0], youtube: e.target.value }]
                            }
                          })}
                          placeholder="YouTube URL"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notifications Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="notifications" className="font-medium">Enable Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications for orders and updates</p>
                    </div>
                    <Checkbox
                      id="notifications"
                      checked={formData.settings.notifications[0]?.is_active || false}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          notifications: [{ is_active: checked === true }]
                        }
                      })}
                      className="h-6 w-6"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Shop...
                      </>
                    ) : (
                      <>
                        <Store className="w-4 h-4 mr-2" />
                        Create Shop
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Screen>
  );
};

export default BecomeSellerPage;
