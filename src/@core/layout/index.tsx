import { cn } from "@/lib/utils";
import { ChildrenType, ClassNameType } from "@/utils/reactTypes";

export const Screen = ({
  children,
  className,
}: {
  children: ChildrenType;
  className?: ClassNameType;
}) => {
  return (
    <div>
      <div
        className={cn(
          "mx-auto 3xl:max-w-[1600px] 2xl:max-w-[1400px] max-w-6xl px-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
