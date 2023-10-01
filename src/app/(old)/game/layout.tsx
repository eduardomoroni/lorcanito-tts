"use client";

import React, { useEffect, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { IdleModal } from "~/spaces/components/modals/IdleModal";
import { useRouter } from "next/navigation";
import { logAnalyticsEvent } from "~/libs/3rd-party/firebase/FirebaseAnalyticsProvider";

const timeout = 300_000;
const promptBeforeIdle = 30_000;

function Layout({ children }: { children: React.ReactNode }) {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [remaining, setRemaining] = useState<number>(timeout);
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const onIdle = () => {
    setIsIdle(true);
    setOpen(false);
  };

  const onActive = () => {
    setIsIdle(false);
    setOpen(false);
  };

  const onPrompt = () => {
    setOpen(true);
  };

  const { getRemainingTime, activate } = useIdleTimer({
    onIdle,
    onActive,
    onPrompt,
    timeout,
    promptBeforeIdle,
    throttle: 1000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isIdle && process.env.NODE_ENV === "production") {
      logAnalyticsEvent("idle");
      router.push("/idle");
    }
  }, [isIdle]);

  return (
    <>
      {children}
      {open ? (
        <IdleModal open={open} timeout={remaining} onConfirm={activate} />
      ) : null}
    </>
  );
}

export default Layout;
