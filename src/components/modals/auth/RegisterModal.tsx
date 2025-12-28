"use client";
import React, { useEffect } from "react";
import { ShadDialog } from "../../dialog/ShadDialog";
import { RegisterForm } from "@/components/forms/auth/RegisterForm";
import SiginModal from "./SiginModal";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  showTrigger?: boolean;
}
const RegisterModal = ({ open, setOpen, trigger, showTrigger = false }: Props) => {
  const [siginModal, setSiginModal] = React.useState(false);
  const close = () => {
    setOpen(false);
  };
  useEffect(() => {
    setSiginModal(false);
  }, []);

  // Don't render trigger button when modal is controlled externally
  const triggerElement = showTrigger
    ? trigger || (
        <button className="hover:text-primary transition-colors cursor-pointer">
          Register
        </button>
      )
    : undefined;

  if (siginModal) {
    return <SiginModal open={siginModal} setOpen={setSiginModal} />;
  }
  return (
    <ShadDialog
      open={open}
      onOpenChange={setOpen}
      title="Register new account"
      trigger={triggerElement}
    >
      <RegisterForm close={close} setSiginModal={setSiginModal} />
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <button
          className="text-primary hover:underline cursor-pointer"
          onClick={() => {
            setSiginModal(true);
          }}
        >
          Sign in
        </button>
      </p>
    </ShadDialog>
  );
};

export default RegisterModal;
