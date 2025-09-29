"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductImage({
  image,
  alt,
  defaultImage = "/assets/defaultProductImage.png",
}: {
  image?: string | { original?: string };
  alt: string;
  defaultImage?: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    typeof image === "string" ? image : image?.original || defaultImage
  );

  return (
    <Image
      className="mx-auto rounded-lg m-0"
      src={imgSrc}
      alt={alt}
      width={500}
      height={500}
      onError={() => setImgSrc(defaultImage)}
    />
  );
}
