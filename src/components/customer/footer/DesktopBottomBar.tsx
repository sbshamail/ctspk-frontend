import { Screen } from "@/@core/layout";
import SocialIcons from "@/components/icons/SocialIcons";

export const DesktopBottomBar = () => {
  return (
    <div className=" py-2  border-t border-border md:fixed md:bottom-0 w-full z-50 bg-background">
      <Screen>
        <div className="md:h-10  w-full flex items-center  mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="w-full flex flex-col gap-6 md:flex-row justify-between items-center">
            <div className="text-foreground text-sm">
              © 2025 GHER TAK. All rights reserved.
            </div>
            <div className="flex space-x-12 text-sm md:mt-0 flex-col md:flex-row gap-6">
              <SocialIcons />
            </div>
          </div>
        </div>
      </Screen>
    </div>
  );
};
