"use client";
import React, { useEffect } from "react";
import { ShadDialog } from "../../dialog/ShadDialog";
import { LoginForm } from "../../forms/auth/LoginForm";
import RegisterModal from "./RegisterModal";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  showTrigger?: boolean;
}
const SiginModal = ({ open, setOpen, trigger, showTrigger = false }: Props) => {
  const [registerModal, setRegisterModal] = React.useState(false);
  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open === true) {
      setRegisterModal(false);
    }
  }, [open]);

  // Don't render trigger button when modal is controlled externally
  const triggerElement = showTrigger
    ? trigger || (
        <button className="hover:text-primary transition-colors cursor-pointer">
          Sign In
        </button>
      )
    : undefined;

  return (
    <>
      {registerModal ? (
        <RegisterModal open={registerModal} setOpen={setRegisterModal} />
      ) : (
        <ShadDialog
          open={open}
          onOpenChange={setOpen}
          title="Sign In to Your Account"
          trigger={triggerElement}
        >
          <LoginForm close={close} />
          <p className="text-center text-sm text-muted-foreground mt-4">
            New here?{" "}
            <button
              className="text-primary hover:underline cursor-pointer"
              onClick={() => {
                setRegisterModal(true);
                setOpen(false);
              }}
            >
              Register
            </button>
          </p>
        </ShadDialog>
      )}
    </>
  );
};

export default SiginModal;
