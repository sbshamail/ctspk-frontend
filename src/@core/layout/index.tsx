import { ChildrenType } from "@/utils/reactTypes";

export const Screen = ({ children }: { children: ChildrenType }) => {
  return (
    <div>
      <div
        className={`mx-auto 3xl:max-w-[1600px] 2xl:max-w-[1400px]  max-w-6xl px-2`}
      >
        {children}
      </div>
    </div>
  );
};
