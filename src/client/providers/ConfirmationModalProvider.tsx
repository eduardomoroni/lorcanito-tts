import React, { createContext, useContext, useState } from "react";

import { ConfirmationModal } from "~/client/components/modals/ConfirmationModal";

const Context = createContext<{
  setModalProps: (args: {
    title: string;
    text: string;
    onConfirm: () => void;
  }) => void;
  setOpen: (open: boolean) => void;
}>({ setModalProps: () => {}, setOpen: () => {} });

export function ConfirmationModalProvider({
  children,
}: {
  children: JSX.Element;
}) {
  const [modalProps, setModalProps] = useState({
    title: "Confirmation",
    text: "Are you sure you want to do this?",
    onConfirm: () => {},
  });
  const [open, setOpen] = useState(false);

  return (
    <Context.Provider value={{ setModalProps, setOpen }}>
      {children}
      {open && (
        <ConfirmationModal open={open} setOpen={setOpen} {...modalProps} />
      )}
    </Context.Provider>
  );
}

export function useConfirmationModal(title: string, text: string) {
  const { setModalProps, setOpen } = useContext(Context);

  return (
    onConfirm: () => void,
    titleOverride?: string,
    textOverride?: string,
  ) => {
    setModalProps({
      title: titleOverride || title,
      text: textOverride || text,
      onConfirm,
    });
    setOpen(true);
  };
}
