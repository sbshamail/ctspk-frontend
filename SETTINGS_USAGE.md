# Settings Management Documentation

This document explains how the site settings are managed and how to use them throughout the application.

## Overview

The application fetches settings from the API endpoint `/settings?language=en` on initial load and stores them in localStorage for efficient access throughout the site.

## Features

### 1. **Automatic Settings Fetch**
- Settings are automatically fetched when the app loads via `SettingsProvider`
- Stored in localStorage for quick access
- Includes SEO metadata, logo, taxClass, shippingClass, and more

### 2. **SEO Metadata**
The following metadata is automatically set based on API response:
- `siteTitle` - Page title
- `metaDescription` - Meta description tag
- `metaKeywords` - Meta keywords tag
- `ogTitle` - Open Graph title
- `ogDescription` - Open Graph description
- `canonicalUrl` - Canonical URL
- `twitterHandle` - Twitter handle
- `twitterCardType` - Twitter card type (default: "summary_large_image")
- Logo from `logo.original` field

### 3. **Favicon**
- Uses `/public/favicon.ico` file
- Automatically linked in the layout

### 4. **Logo Display**
- Uses `logo.original` if available from API
- Falls back to displaying `siteTitle` as text if logo is not available
- Includes `siteSubtitle` as tagline (optional)

### 5. **localStorage Storage**
The following items are stored in localStorage:

| Key | Description |
|-----|-------------|
| `siteSettings` | Complete settings object from API |
| `taxClass` | Tax class configuration |
| `shippingClass` | Shipping class configuration |

## Usage Examples

### 1. Using the `useSettings` Hook

```tsx
"use client";

import { useSettings } from "@/lib/useSettings";

export function MyComponent() {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{settings?.siteTitle}</h1>
      <p>{settings?.siteSubtitle}</p>
    </div>
  );
}
```

### 2. Using Helper Functions

```tsx
import {
  getSetting,
  getTaxClass,
  getShippingClass,
  getLogoUrl,
  getSiteTitle,
  getSiteSubtitle,
} from "@/lib/useSettings";

// Get any setting by key
const siteTitle = getSetting("siteTitle");

// Get tax class
const taxClass = getTaxClass();

// Get shipping class
const shippingClass = getShippingClass();

// Get logo URL
const logoUrl = getLogoUrl();

// Get site title
const title = getSiteTitle(); // Falls back to "GHERTAK" if not found

// Get site subtitle/tagline
const tagline = getSiteSubtitle();
```

### 3. Using the `SiteLogo` Component

```tsx
import { SiteLogo } from "@/components/common/SiteLogo";

export function Header() {
  return (
    <header>
      {/* Basic usage */}
      <SiteLogo />

      {/* With custom size */}
      <SiteLogo width={200} height={60} />

      {/* With tagline */}
      <SiteLogo showTagline={true} />

      {/* With custom className */}
      <SiteLogo className="my-4" />
    </header>
  );
}
```

### 4. Accessing Settings in Server Components

Since server components can't access localStorage, fetch settings directly:

```tsx
import { fetchApi } from "@/action/fetchApi";

async function getSettings() {
  const response = await fetchApi({
    url: "settings?language=en",
    method: "GET",
  });

  if (response?.success === 1 && response.data) {
    return response.data;
  }
  return null;
}

export default async function MyServerComponent() {
  const settings = await getSettings();

  return (
    <div>
      <h1>{settings?.siteTitle}</h1>
    </div>
  );
}
```

## API Response Structure

Expected structure from `/settings?language=en`:

```json
{
  "success": 1,
  "data": {
    "siteTitle": "Your Site Title",
    "siteSubtitle": "Your tagline",
    "metaDescription": "Site description",
    "metaKeywords": "keyword1, keyword2, keyword3",
    "ogTitle": "Open Graph Title",
    "ogDescription": "Open Graph Description",
    "canonicalUrl": "https://yoursite.com",
    "twitterHandle": "@yourtwitterhandle",
    "twitterCardType": "summary_large_image",
    "logo": {
      "original": "https://yoursite.com/path/to/logo.png",
      "thumbnail": "https://yoursite.com/path/to/logo-thumb.png"
    },
    "taxClass": {
      "id": 1,
      "name": "Standard Tax",
      "rate": 15,
      "type": "percentage"
    },
    "shippingClass": {
      "id": 1,
      "name": "Standard Shipping",
      "amount": 50,
      "type": "fixed"
    }
  }
}
```

## Files Modified/Created

1. **Created:**
   - `src/components/providers/SettingsProvider.tsx` - Fetches and stores settings
   - `src/lib/useSettings.ts` - Hook and helper functions for accessing settings
   - `src/components/common/SiteLogo.tsx` - Logo component with fallback

2. **Modified:**
   - `src/app/layout.tsx` - Added dynamic metadata generation and SettingsProvider
   - Added favicon link to `/public/favicon.ico`

## Important Notes

1. **Client vs Server Components:**
   - `useSettings` hook only works in client components
   - Use helper functions like `getSetting()` for client-side access
   - Fetch settings directly in server components

2. **LocalStorage:**
   - Settings are cached in localStorage after first fetch
   - To refresh settings, clear localStorage or reload the page

3. **Fallbacks:**
   - All functions include fallback values
   - If logo is not available, site title is displayed as text
   - Default site title is "GHERTAK" if not found in settings

4. **Performance:**
   - Settings are fetched once on app load
   - Subsequent accesses use localStorage (fast)
   - No additional API calls needed after initial load
