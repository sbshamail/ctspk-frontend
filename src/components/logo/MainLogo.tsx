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
          height={36}
          width={60}
        />
      </Link>
      <span className="text-[0.5rem] text-gray-400 uppercase tracking-wide">we make it easy, always!</span>
    </div>
  );
};
