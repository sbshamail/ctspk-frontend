"use client";

import { useSettings, getSiteTitle } from "@/lib/useSettings";
import Image from "next/image";
import Link from "next/link";

interface SiteLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showTagline?: boolean;
}

export function SiteLogo({
  className = "",
  width = 150,
  height = 50,
  showTagline = false,
}: SiteLogoProps) {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded" style={{ width, height }} />
      </div>
    );
  }

  const logoUrl = settings?.logo?.original;
  const siteTitle = settings?.siteTitle || getSiteTitle();
  const siteSubtitle = settings?.siteSubtitle || "";

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {logoUrl ? (
        <div className="flex flex-col">
          <Image
            src={logoUrl}
            alt={siteTitle}
            width={width}
            height={height}
            className="object-contain"
            priority
          />
          {showTagline && siteSubtitle && (
            <span className="text-xs text-muted-foreground mt-1">
              {siteSubtitle}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-primary">{siteTitle}</h1>
          {showTagline && siteSubtitle && (
            <span className="text-xs text-muted-foreground">
              {siteSubtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
