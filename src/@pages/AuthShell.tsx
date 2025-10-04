import type React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <main
      className={cn("min-h-dvh grid grid-cols-1 md:grid-cols-2", className)}
    >
      {/* Left: brand/visual panel */}
      <aside className="hidden md:flex ">
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="relative rounded-lg overflow-hidden  mb-6">
              <Image
                src="/assets/cart-login.jpg"
                alt="Preview of a multi-vendor marketplace storefront"
                width={720}
                height={480}
                className="h-auto w-full"
                priority
              />
            </div>
            {/* <h2 className="text-balance text-2xl font-semibold">
              A Marketplace Built for Buyers and Sellers
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Connecting buyers and sellers with a platform that’s fast,
              reliable, and built to scale.
            </p> */}
          </div>
        </div>
      </aside>

      {/* Right: form area */}
      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-muted-foreground">
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            {children}
            {footer ? (
              <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
