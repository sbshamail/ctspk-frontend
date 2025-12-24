"use client";

import { useState, useEffect } from "react";
import { isPromoPopupEnabled, getPromoPopupData } from "@/lib/useSettings";
import PromoPopup from "./PromoPopup";

export function PromoPopupWrapper() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait a bit for settings to be loaded from localStorage
    const checkSettings = () => {
      const enabled = isPromoPopupEnabled();
      const data = getPromoPopupData();

      setIsEnabled(enabled);
      setPopupData(data);
      setIsReady(true);
    };

    // Check immediately
    checkSettings();

    // Also check after a delay in case settings are being loaded
    const timer = setTimeout(checkSettings, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until we've checked settings
  if (!isReady) return null;

  return <PromoPopup isEnabled={isEnabled} popupData={popupData} />;
}

export default PromoPopupWrapper;
