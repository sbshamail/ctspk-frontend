"use client";
import { Screen } from "@/@core/layout";
import { ThemeToggle } from "@/@core/theme/ThemeToggle";
import { MainLogo } from "@/components/logo/MainLogo";
import SiginModal from "@/components/modals/auth/SiginModal";
import { useSelection } from "@/lib/useSelection";
import { useState } from "react";
import AuthHeaderDropdown from "../dropdown/AuthHeaderDropdown";

export const MobileBottomBar = () => {
  const { data: auth, isLoading } = useSelection("auth", true);
  const [openSiginModal, setOpenSiginModal] = useState(false);
  return (
    <div className=" py-2  border-t border-border fixed bottom-0 w-full z-50 bg-background">
      <Screen>
        <div className="h-10  w-full flex items-center  justify-between ">
          <MainLogo className=" w-12" />
          <div className="flex items-center gap-2">
            {" "}
            <ThemeToggle />
            <div className="flex space-x-12 text-sm md:mt-0 flex-col md:flex-row gap-6">
              {!auth ? (
                <>
                  <SiginModal
                    open={openSiginModal}
                    setOpen={setOpenSiginModal}
                  />
                </>
              ) : (
                <AuthHeaderDropdown auth={auth} />
              )}
            </div>
          </div>
        </div>
      </Screen>
    </div>
  );
};
