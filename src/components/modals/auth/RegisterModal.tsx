"use client";
import React, { useEffect } from "react";
import { ShadDialog } from "../../dialog/ShadDialog";
import { RegisterForm } from "@/components/forms/auth/RegisterForm";
import SiginModal from "./SiginModal";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
}
const RegisterModal = ({ open, setOpen, trigger }: Props) => {
  const [siginModal, setSiginModal] = React.useState(false);
  const close = () => {
    setOpen(false);
  };
  useEffect(() => {
    setSiginModal(false);
  }, []);
  if (siginModal) {
    return <SiginModal open={siginModal} setOpen={setSiginModal} />;
  }
  return (
    <div>
      <div className="">
        <ShadDialog
          open={open}
          onOpenChange={setOpen}
          title="Register new account"
          trigger={
            trigger || (
              <button className="hover:text-primary transition-colors cursor-pointer">
                Register
              </button>
            )
          }
        >
          <RegisterForm close={close} setSiginModal={setSiginModal} />
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <button
              className="text-primary hover:underline cursor-pointer"
              onClick={() => {
                setSiginModal(true); // 👈 open SignIn modal
              }}
            >
              Sign in
            </button>
          </p>
        </ShadDialog>
      </div>
    </div>
  );
};

export default RegisterModal;
