"use client";

import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";

export type FullScreenTableType = {
  fullScreen?: boolean;
  setFullScreen?: (v: boolean) => void;
};

export default function FullScreenTable({
  fullScreen,
  setFullScreen,
}: FullScreenTableType) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setFullScreen?.(!fullScreen)}
      aria-pressed={fullScreen}
      title={fullScreen ? "Exit fullscreen" : "Fullscreen"}
    >
      {fullScreen ? (
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
      )}
    </Button>
  );
}
