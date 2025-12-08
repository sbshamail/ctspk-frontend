"use client";

import { fetchApi } from "@/action/fetchApi";
import { useEffect, useState } from "react";

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndStoreSettings = async () => {
      try {
        // Fetch settings from API
        const response = await fetchApi({
          url: "settings?language=en",
          method: "GET",
        });

        if (response?.success === 1 && response.data) {
          const settings = response.data;

          // Store the complete settings object in localStorage
          localStorage.setItem("siteSettings", JSON.stringify(settings));

          // Store taxClass in localStorage if available
          if (settings.taxClass) {
            localStorage.setItem("taxClass", JSON.stringify(settings.taxClass));
          }

          // Store shippingClass in localStorage if available
          if (settings.shippingClass) {
            localStorage.setItem(
              "shippingClass",
              JSON.stringify(settings.shippingClass)
            );
          }

          // Update document title
          if (settings.siteTitle) {
            document.title = settings.siteTitle;
          }

          // Update meta tags
          updateMetaTag("description", settings.metaDescription);
          updateMetaTag("keywords", settings.metaKeywords);

          // Update Open Graph tags
          updateMetaTag("og:title", settings.ogTitle || settings.siteTitle);
          updateMetaTag(
            "og:description",
            settings.ogDescription || settings.metaDescription
          );
          updateMetaTag("og:image", settings.logo?.original);

          // Update Twitter Card tags
          updateMetaTag("twitter:card", settings.twitterCardType || "summary_large_image");
          updateMetaTag("twitter:site", settings.twitterHandle);
          updateMetaTag("twitter:title", settings.ogTitle || settings.siteTitle);
          updateMetaTag(
            "twitter:description",
            settings.ogDescription || settings.metaDescription
          );
          updateMetaTag("twitter:image", settings.logo?.original);

          // Update canonical URL
          if (settings.canonicalUrl) {
            updateCanonicalLink(settings.canonicalUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndStoreSettings();
  }, []);

  return <>{children}</>;
}

// Helper function to update or create meta tags
function updateMetaTag(name: string, content: string | undefined) {
  if (!content) return;

  // Check if it's an Open Graph or Twitter tag
  const attribute = name.startsWith("og:") || name.startsWith("twitter:")
    ? "property"
    : "name";

  let metaTag = document.querySelector(
    `meta[${attribute}="${name}"]`
  ) as HTMLMetaElement;

  if (!metaTag) {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }

  metaTag.content = content;
}

// Helper function to update canonical link
function updateCanonicalLink(url: string) {
  let canonicalLink = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement;

  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }

  canonicalLink.href = url;
}
