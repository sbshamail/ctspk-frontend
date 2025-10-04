"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Search, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface MainSearchbarProps {
  className?: string;
}

const MainSearchbar = ({ className }: MainSearchbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [term, setTerm] = useState("");

  // ✅ Sync with URL param if on /product page
  useEffect(() => {
    if (pathname === "/product") {
      const current = searchParams.get("searchTerm") ?? "";
      setTerm(current);
    }
  }, [pathname, searchParams]);

  const handleSearch = () => {
    if (!term.trim()) {
      // ✅ Empty term → reset filter
      if (pathname === "/product") {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("searchTerm");
        router.push(`/product?${params.toString()}`);
      }
      return;
    }

    if (pathname === "/product") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("searchTerm", term);
      router.push(`/product?${params.toString()}`);
    } else {
      router.push(`/product?searchTerm=${encodeURIComponent(term)}`);
    }
  };

  const handleClear = () => {
    setTerm("");
    if (pathname === "/product") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("searchTerm");
      router.push(`/product?${params.toString()}`);
    }
  };

  return (
    <div className={cn("hidden lg:flex flex-1 max-w-2xl", className)}>
      <div className="flex w-full border border-border rounded-md">
        <div className="relative flex-1">
          <Input
            placeholder="Search for items..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-none rounded-none pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Right side actions */}
          <div className="flex items-center gap-1 absolute right-1 top-1 h-8">
            {term && (
              <Button size="sm" variant="ghost" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost">
              <Mic className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />
            <Button size="sm" variant="ghost" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSearchbar;
