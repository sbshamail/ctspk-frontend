import { cn } from "@/lib/utils";
import { ClassNameType } from "@/utils/reactTypes";
import Image from "next/image";
import Link from "next/link";

interface MainLogoProps {
  className?: ClassNameType;
}
export const MainLogo = ({ className }: MainLogoProps) => {
  return (
    <div className={cn("w-auto", className)}>
      <Link href="/">
        <Image
          alt="logo"
          src="/assets/imgs/theme/logo.svg"
          height={100}
          width={100}
        />
      </Link>
    </div>
  );
};
