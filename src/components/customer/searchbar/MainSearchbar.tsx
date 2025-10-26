"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Search, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface MainSearchbarProps {
  className?: string;
}

const MainSearchbar = ({ className }: MainSearchbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [term, setTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ✅ Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use type assertion to access the speech recognition API
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTerm(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ✅ Auto-search after voice input completes
  useEffect(() => {
    if (!isListening && term && recognitionRef.current) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, term]);

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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setIsListening(false);
      }
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
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={toggleListening}
              className={isListening ? "bg-red-100 text-red-600" : ""}
            >
              <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
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