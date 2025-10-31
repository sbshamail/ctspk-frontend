"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ClassNameType } from "@/utils/reactTypes";

export default function ProductImage({
  image,
  alt,
  defaultImage = "/assets/defaultProductImage.png",
  className,
}: {
  image?: string | { original?: string };
  alt: string;
  defaultImage?: string;
  className?: ClassNameType;
}) {
  const imgUrl =
    typeof image === "string" ? image : image?.original || defaultImage;

  const [imgSrc, setImgSrc] = useState(imgUrl);

  // 🔥 Update src when the image prop changes
  useEffect(() => {
    setImgSrc(imgUrl);
  }, [imgUrl]);

  return (
    <Image
      key={imgUrl} // 👈 forces remount when URL changes
      className={cn(
        "mx-auto rounded-lg m-0 aspect-square object-cover",
        className
      )}
      src={imgSrc}
      alt={alt}
      width={500}
      height={500}
      unoptimized // optional, disables Next's built-in caching
      onError={() => setImgSrc(defaultImage)}
    />
  );
}
