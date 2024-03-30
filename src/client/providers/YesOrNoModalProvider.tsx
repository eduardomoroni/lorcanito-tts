import React, { createContext, useContext, useState } from "react";

import { YesOrNoModal } from "~/client/components/modals/YesOrNoModal";

export type ModalProps = {
  title: string;
  text: string;
  onYes: () => void;
  onNo: () => void;
};

const Context = createContext<{
  openYesOrNoModal: (args: ModalProps) => void;
  closeYesOrNoModal: () => void;
}>({ openYesOrNoModal: () => {}, closeYesOrNoModal: () => {} });

export function YesOrNoModalProvider({ children }: { children: JSX.Element }) {
  const [modalProps, setModalProps] = useState<ModalProps>({
    title: "Confirmation",
    text: "Are you sure you want to do this?",
    onYes: () => {},
    onNo: () => {},
  });
  const [open, setOpen] = useState(false);

  const openYesOrNoModal = (args: ModalProps) => {
    setModalProps(args);
    setOpen(true);
  };

  const closeYesOrNoModal = () => {
    setOpen(false);
  };

  return (
    <Context.Provider value={{ openYesOrNoModal, closeYesOrNoModal }}>
      {children}
      {open && <YesOrNoModal open={open} setOpen={setOpen} {...modalProps} />}
    </Context.Provider>
  );
}

export function useYesOrNoModal() {
  return useContext(Context);
}
