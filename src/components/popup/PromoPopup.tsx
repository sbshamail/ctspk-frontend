"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoPopupData {
  image?: {
    id?: number;
    original?: string;
    thumbnail?: string;
    file_name?: string;
  };
  title?: string;
  description?: string;
  popUpDelay?: number;
  isPopUpNotShow?: boolean;
  popUpNotShow?: {
    title?: string;
    popUpExpiredIn?: number;
  };
  popUpExpiredIn?: number;
}

interface PromoPopupProps {
  isEnabled: boolean;
  popupData: PromoPopupData | null;
}

const STORAGE_KEY = "promo_popup_last_shown";
const STORAGE_KEY_DONT_SHOW = "promo_popup_dont_show_until";

export function PromoPopup({ isEnabled, popupData }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isConfirmClosing, setIsConfirmClosing] = useState(false);

  // Check if popup should be shown based on localStorage
  const shouldShowPopup = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!isEnabled || !popupData) return false;

    // Check "don't show again" expiry
    const dontShowUntil = localStorage.getItem(STORAGE_KEY_DONT_SHOW);
    if (dontShowUntil) {
      const expiryDate = new Date(dontShowUntil);
      if (new Date() < expiryDate) {
        return false;
      } else {
        // Expired, remove the key
        localStorage.removeItem(STORAGE_KEY_DONT_SHOW);
      }
    }

    // Check if already shown today
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown) {
      const lastShownDate = new Date(lastShown);
      const today = new Date();

      // Check if it's the same day
      if (
        lastShownDate.getFullYear() === today.getFullYear() &&
        lastShownDate.getMonth() === today.getMonth() &&
        lastShownDate.getDate() === today.getDate()
      ) {
        return false;
      }
    }

    return true;
  }, [isEnabled, popupData]);

  // Show popup on mount after popUpDelay
  useEffect(() => {
    if (shouldShowPopup()) {
      // Use popUpDelay for initial delay before showing popup (default 1000ms)
      const delay = popupData?.popUpDelay || 1000;

      const showTimer = setTimeout(() => {
        setIsVisible(true);
        // Mark as shown today
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      }, delay);

      return () => clearTimeout(showTimer);
    }
  }, [shouldShowPopup, popupData?.popUpDelay]);

  // Handle close button click - show confirmation if isPopUpNotShow is true
  const handleCloseClick = () => {
    if (popupData?.isPopUpNotShow) {
      // Show confirmation dialog
      setShowConfirmDialog(true);
    } else {
      // Just close the popup
      closeMainPopup();
    }
  };

  // Close main popup with animation
  const closeMainPopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  // Handle "Don't show again" confirmation
  const handleDontShowAgain = () => {
    const expireDays = popupData?.popUpNotShow?.popUpExpiredIn || popupData?.popUpExpiredIn || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expireDays);
    localStorage.setItem(STORAGE_KEY_DONT_SHOW, expiryDate.toISOString());

    // Close confirmation dialog and main popup
    setIsConfirmClosing(true);
    setTimeout(() => {
      setShowConfirmDialog(false);
      setIsConfirmClosing(false);
      closeMainPopup();
    }, 300);
  };

  // Handle "Show again tomorrow" - just close for today
  const handleShowTomorrow = () => {
    setIsConfirmClosing(true);
    setTimeout(() => {
      setShowConfirmDialog(false);
      setIsConfirmClosing(false);
      closeMainPopup();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  const handleConfirmBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleShowTomorrow();
    }
  };

  if (!isVisible || !popupData) return null;

  return (
    <>
      {/* Main Promo Popup */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleBackdropClick}
      >
        <div
          className={cn(
            "relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300",
            isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          )}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseClick}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Close popup"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Image Section */}
          {popupData.image?.original && (
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5">
              <Image
                src={popupData.image.original}
                alt={popupData.title || "Promotional offer"}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6 text-center">
            {/* Title */}
            {popupData.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {popupData.title}
              </h2>
            )}

            {/* Description */}
            {popupData.description && (
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                {popupData.description}
              </p>
            )}

            {/* Shop Now Button */}
            <button
              onClick={handleCloseClick}
              className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Shop Now
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Confirmation Dialog - "Don't show again?" */}
      {showConfirmDialog && (
        <div
          className={cn(
            "fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            isConfirmClosing ? "opacity-0" : "opacity-100"
          )}
          onClick={handleConfirmBackdropClick}
        >
          <div
            className={cn(
              "relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 p-6",
              isConfirmClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            )}
          >
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {popupData.popUpNotShow?.title || "Don't show this popup again"}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm text-center mb-6">
              You won't see this offer for the next {popupData.popUpNotShow?.popUpExpiredIn || popupData.popUpExpiredIn || 7} days
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDontShowAgain}
                className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
              >
                Yes, Don't Show Again
              </button>
              <button
                onClick={handleShowTomorrow}
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                No, Remind Me Tomorrow
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PromoPopup;
