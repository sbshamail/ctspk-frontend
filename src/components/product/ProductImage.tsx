"use client";
import { useState } from "react";
import Image from "next/image";
import { ClassNameType } from "@/utils/reactTypes";
import { cn } from "@/lib/utils";

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
  const [imgSrc, setImgSrc] = useState(
    typeof image === "string" ? image : image?.original || defaultImage
  );

  return (
    <Image
      className={cn(
        "mx-auto rounded-lg m-0 aspect-square object-cover",
        className
      )}
      src={imgSrc}
      alt={alt}
      width={500}
      height={500}
      onError={() => setImgSrc(defaultImage)}
    />
  );
}
