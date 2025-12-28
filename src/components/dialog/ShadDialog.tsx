"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

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
          "max-w-md sm:max-w-lg",
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="pr-8">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="py-2">{children}</div>

        {footer && (
          <DialogFooter className="pt-4 border-t border-border">
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
