import React from "react";
import { ShadDialog } from "../dialog/ShadDialog";
import { LoginForm } from "../forms/auth/LoginForm";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
}
const SiginModal = ({ open, setOpen, trigger }: Props) => {
  const close = () => {
    setOpen(false);
  };
  return (
    <div>
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
              //   onClick={handleSwitch}
              className="text-primary hover:underline cursor-pointer"
            >
              Register
            </button>
          </p>
        </ShadDialog>
      </div>
    </div>
  );
};

export default SiginModal;
