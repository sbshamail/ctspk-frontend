"use client";
import React, { useEffect } from "react";
import { ShadDialog } from "../../dialog/ShadDialog";
import { LoginForm } from "../../forms/auth/LoginForm";
import RegisterModal from "./RegisterModal";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
}
const SiginModal = ({ open, setOpen, trigger }: Props) => {
  const [registerModal, setRegisterModal] = React.useState(false);
  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open === true) {
      setRegisterModal(false);
    }
  }, [open]);
  return (
    <div>
      {registerModal ? (
        <RegisterModal open={registerModal} setOpen={setRegisterModal} />
      ) : (
        <div className="">
          <ShadDialog
            open={open}
            onOpenChange={setOpen}
            title="Sign In to Your Account"
            trigger={
              trigger || (
                <button className="hover:text-primary transition-colors cursor-pointer">
                  Sign In
                </button>
              )
            }
          >
            <LoginForm close={close} />
            <p className="text-center text-sm text-muted-foreground mt-4">
              New here?{" "}
              <button
                className="text-primary hover:underline cursor-pointer"
                onClick={() => {
                  setRegisterModal(true); // 👈 open Register modal
                  setOpen(false); // 👈 close SignIn modal
                }}
              >
                Register
              </button>
            </p>
          </ShadDialog>
        </div>
      )}
    </div>
  );
};

export default SiginModal;
