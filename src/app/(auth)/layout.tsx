import React from "react";
import { Bottombar } from "@/components/customer/layout/Footer";
import { MainHeader } from "@/components/customer/layout/Header";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <MainHeader />
      {children}
      <Bottombar />
    </div>
  );
};

export default layout;
