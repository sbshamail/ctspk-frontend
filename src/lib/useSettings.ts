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
  // New settings for site-wide features
  deliveryTime?: string;
  paymentGateway?: any;
  IsRatting?: boolean;
  IsReview?: boolean;
  homePagePopup?: any;
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

// Helper function to check if ratings should be shown
// Returns true only if IsRatting is explicitly set to true
export function isRatingEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const isRatting = getSetting("IsRatting");
  return isRatting === true;
}

// Helper function to check if reviews should be shown
// Returns true only if IsReview or isProductReview is explicitly set to true
export function isReviewEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const isReview = getSetting("IsReview");
  const isProductReview = getSetting("isProductReview");
  return isReview === true || isProductReview === true;
}

// Helper function to get delivery time
export function getDeliveryTime(): string | null {
  return getSetting("deliveryTime") || null;
}

// Helper function to get payment gateway info
export function getPaymentGateway(): any {
  return getSetting("paymentGateway") || null;
}

// Helper function to get home page popup info
export function getHomePagePopup(): any {
  return getSetting("homePagePopup") || null;
}

// Helper function to check if promo popup is enabled
export function isPromoPopupEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const isPromoPopUp = getSetting("isPromoPopUp");
  return isPromoPopUp === true;
}

// Helper function to get promo popup data
export function getPromoPopupData(): any {
  if (typeof window === "undefined") return null;
  return getSetting("promoPopup") || null;
}

// Helper function to check if product review is enabled (from isProductReview in settings)
export function isProductReviewEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const isProductReview = getSetting("isProductReview");
  return isProductReview === true;
}

// Helper function to check if review popup is enabled
export function isReviewPopupEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const enableReviewPopup = getSetting("enableReviewPopup");
  return enableReviewPopup === true;
}

// Helper function to get ReturnItemDays setting
export function getReturnItemDays(): number {
  if (typeof window === "undefined") return 0;
  const days = getSetting("ReturnItemDays");
  return typeof days === "number" ? days : 0;
}

// Helper function to get OrderReviewDays setting
export function getOrderReviewDays(): number {
  if (typeof window === "undefined") return 0;
  const days = getSetting("OrderReviewDays");
  return typeof days === "number" ? days : 0;
}

// Helper function to check if action is within allowed days from completed date
export function isWithinAllowedDays(completedDate: string | null | undefined, allowedDays: number): boolean {
  if (!completedDate || allowedDays <= 0) return false;

  const completed = new Date(completedDate);
  const deadline = new Date(completed);
  deadline.setDate(deadline.getDate() + allowedDays);

  const currentDate = new Date();
  return deadline > currentDate;
}

// Helper function to check if return is allowed based on completed date and ReturnItemDays
export function isReturnAllowed(completedDate: string | null | undefined): boolean {
  const returnItemDays = getReturnItemDays();
  return isWithinAllowedDays(completedDate, returnItemDays);
}

// Helper function to check if review is allowed based on completed date and OrderReviewDays
export function isOrderReviewAllowed(completedDate: string | null | undefined): boolean {
  const orderReviewDays = getOrderReviewDays();
  return isWithinAllowedDays(completedDate, orderReviewDays);
}
