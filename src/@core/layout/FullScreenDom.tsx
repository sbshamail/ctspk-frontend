"use client";

import { ClassNameType } from "@/utils/reactTypes";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { twMerge } from "tailwind-merge";

interface FullScreenDomType {
  open: boolean;
  children: React.ReactNode;
  className?: ClassNameType;
  /**
   * Called when user requests close (Escape or backdrop click).
   * If omitted the component will simply not call anything and parent must change `open`.
   */
  onClose?: () => void;
  /**
   * Whether pressing Escape key should trigger onClose (default: true)
   */
  closeOnEsc?: boolean;
  /**
   * Whether clicking backdrop should trigger onClose (default: true)
   */
  closeOnBackdrop?: boolean;
  /**
   * Whether to show a semi-transparent backdrop behind the content (default: true)
   */
  showBackdrop?: boolean;
  /**
   * Optional id of portal container (defaults to document.body)
   */
  portalId?: string;
}

const FullScreenDom: React.FC<FullScreenDomType> = ({
  open,
  children,
  className,
  onClose,
  closeOnEsc = true,
  closeOnBackdrop = true,
  showBackdrop = true,
  portalId,
}) => {
  const previousOverflowRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  // Ensure SSR-safety: only operate when document exists
  const getPortalElement = () => {
    if (typeof document === "undefined") return null;
    if (portalId) {
      const el = document.getElementById(portalId);
      if (el) return el;
    }
    const byId = document.getElementById("modal-root");
    return byId ?? document.body;
  };

  useEffect(() => {
    if (!open) return;

    // Save previous overflow and lock scrolling on html/body
    if (typeof document !== "undefined") {
      previousOverflowRef.current =
        document.documentElement.style.overflow || "";
      // also guard body overflow (some projects set it)
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      mountedRef.current = true;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        onClose?.();
      }
    };

    if (closeOnEsc) {
      window.addEventListener("keydown", handleKey);
    }

    return () => {
      // restore overflow when closed / unmounted
      if (mountedRef.current && typeof document !== "undefined") {
        document.documentElement.style.overflow =
          previousOverflowRef.current ?? "";
        document.body.style.overflow = "";
        mountedRef.current = false;
      }
      if (closeOnEsc) {
        window.removeEventListener("keydown", handleKey);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closeOnEsc, onClose]);

  // If not open — render children in-place (matching your original behaviour)
  if (!open) return <>{children}</>;

  const portalEl = getPortalElement();
  if (!portalEl) return null;

  // Backdrop click handler (only when enabled)
  const handleBackdropClick = (e: React.MouseEvent) => {
    // only close when clicking the backdrop itself (not the children)
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Very high z-index so it sits above everything (max 32-bit signed int)
  const zIndexStyle = { zIndex: 2147483647 };

  return ReactDOM.createPortal(
    <div
      aria-modal="true"
      role="dialog"
      // fixed full-screen container ensures the element is above everything.
      style={zIndexStyle}
      className={twMerge(
        "fixed inset-0 w-full h-full flex items-start justify-center",
        "pointer-events-auto"
        // Important: this sets extremely high stacking; use inline style to be sure
      )}
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div
          onMouseDown={handleBackdropClick}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          // ensure backdrop sits behind content but above other UI
          style={{ zIndex: 1 }}
        />
      )}

      {/* Content wrapper */}
      <div
        // stop propagation so clicks inside content don't trigger backdrop handler
        onMouseDown={(e) => e.stopPropagation()}
        className={twMerge(
          "relative w-full h-full overflow-auto",
          // put content above the backdrop
          "z-10",
          className
        )}
      >
        {children}
      </div>
    </div>,
    portalEl
  );
};

export default FullScreenDom;
