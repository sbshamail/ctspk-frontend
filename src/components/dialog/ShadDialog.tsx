"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReusableModalProps {
  /** Modal title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Trigger element — usually a button */
  trigger?: React.ReactNode;
  /** Modal content body */
  children: React.ReactNode;
  /** Footer content — buttons etc. */
  footer?: React.ReactNode;
  /** Optional className for content */
  className?: string;
  /** Control from parent (if needed) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ShadDialog: React.FC<ReusableModalProps> = ({
  title,
  description,
  trigger,
  children,
  footer,
  className,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn(
          "sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-0",
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="p-6 border-b border-border">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="p-6">{children}</div>

        {footer && (
          <DialogFooter className="p-6 border-t border-border">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function ExampleShadDialog() {
  return (
    <div className="flex items-center justify-center h-screen">
      <ShadDialog
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        trigger={<Button variant="destructive">Delete</Button>}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Confirm</Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Please confirm your action below.
        </p>
      </ShadDialog>
    </div>
  );
}
