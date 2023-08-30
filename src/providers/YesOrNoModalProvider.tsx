import React, { createContext, useContext, useEffect, useState } from "react";

import { YesOrNoModal } from "~/components/modals/YesOrNoModal";
import { useHotkeysContext } from "react-hotkeys-hook";

type ModalProps = {
  title: string;
  text: string;
  onYes: () => void;
  onNo: () => void;
};

const Context = createContext<{
  setModalProps: (args: ModalProps) => void;
  setOpen: (open: boolean) => void;
}>({ setModalProps: () => {}, setOpen: () => {} });

export function YesOrNoModalProvider({ children }: { children: JSX.Element }) {
  const [modalProps, setModalProps] = useState<ModalProps>({
    title: "Confirmation",
    text: "Are you sure you want to do this?",
    onYes: () => {},
    onNo: () => {},
  });
  const [open, setOpen] = useState(false);

  return (
    <Context.Provider value={{ setModalProps, setOpen }}>
      {children}
      {open && <YesOrNoModal open={open} setOpen={setOpen} {...modalProps} />}
    </Context.Provider>
  );
}

export function useYesOrNoModal() {
  const { setModalProps, setOpen } = useContext(Context);

  return (params: ModalProps) => {
    setModalProps(params);
    setOpen(true);
  };
}
