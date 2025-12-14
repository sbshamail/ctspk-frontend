"use client";

import { useEffect, useState } from "react";

export interface SiteSettings {
  siteTitle?: string;
  siteSubtitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  twitterHandle?: string;
  twitterCardType?: string;
  logo?: {
    original?: string;
    thumbnail?: string;
  };
  taxClass?: any;
  shippingClass?: any;
  [key: string]: any;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get settings from localStorage
    const storedSettings = localStorage.getItem("siteSettings");

    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Failed to parse settings from localStorage:", error);
      }
    }

    setIsLoading(false);
  }, []);

  return { settings, isLoading };
}

// Helper function to get specific setting value
export function getSetting(key: string): any {
  if (typeof window === "undefined") return null;

  const storedSettings = localStorage.getItem("siteSettings");

  if (storedSettings) {
    try {
      const settings = JSON.parse(storedSettings);
      return settings[key];
    } catch (error) {
      console.error("Failed to parse settings from localStorage:", error);
    }
  }

  return null;
}

// Helper function to get taxClass from localStorage
export function getTaxClass(): any {
  if (typeof window === "undefined") return null;

  const storedTaxClass = localStorage.getItem("taxClass");

  if (storedTaxClass) {
    try {
      return JSON.parse(storedTaxClass);
    } catch (error) {
      console.error("Failed to parse taxClass from localStorage:", error);
    }
  }

  return null;
}

// Helper function to get shippingClass from localStorage
export function getShippingClass(): any {
  if (typeof window === "undefined") return null;

  const storedShippingClass = localStorage.getItem("shippingClass");

  if (storedShippingClass) {
    try {
      return JSON.parse(storedShippingClass);
    } catch (error) {
      console.error("Failed to parse shippingClass from localStorage:", error);
    }
  }

  return null;
}

// Helper function to get logo URL
export function getLogoUrl(): string | null {
  if (typeof window === "undefined") return null;

  const settings = getSetting("logo");
  return settings?.original || null;
}

// Helper function to get site title
export function getSiteTitle(): string {
  return getSetting("siteTitle") || "GHERTAK";
}

// Helper function to get site subtitle/tagline
export function getSiteSubtitle(): string {
  return getSetting("siteSubtitle") || "";
}
