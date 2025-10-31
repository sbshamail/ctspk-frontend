"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  zIndex?: number;
}

const Modal = ({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  zIndex = 9999,
}: Props) => {
  const modalRoot =
    typeof window !== "undefined"
      ? document.getElementById("modal-root") ||
        (() => {
          const div = document.createElement("div");
          div.id = "modal-root";
          document.body.appendChild(div);
          return div;
        })()
      : null;

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !modalRoot) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all",
        overlayClassName
      )}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-background rounded-xl shadow-lg p-6 relative max-w-md w-full animate-in fade-in-0 zoom-in-95",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
