import React, { type FC, useEffect, useState } from "react";
import { ResizableBox } from "react-resizable";
import { Handle } from "~/spaces/Log/Handle";
import { VirtualizedLogList } from "~/spaces/Log/VirtualizedLogList";
import { useGameLogContext } from "~/spaces/Log/game-log/GameLogProvider";
import { ErrorBoundary } from "~/spaces/components/ErrorBoundary";

export const GameLog: FC = () => {
  // Logs are handled by chat now
  return null;
  const { isActive, setIsActive } = useGameLogContext();
  const [size, setSize] = useState({
    width: isActive ? 250 : 200,
    height: isActive ? 150 : 100,
  });

  useEffect(() => {
    if (isActive) {
      setSize({ width: 250, height: 150 });
    }
  }, [isActive]);

  return (
    <ResizableBox
      className="absolute left-0 top-0 z-40 m-1 overflow-y-auto overflow-x-hidden rounded-md border border-white bg-black bg-opacity-75 shadow-md scrollbar-hide hover:z-50 hover:bg-opacity-100"
      width={size.width}
      height={size.height}
      minConstraints={[100, 100]}
      maxConstraints={[500, 500]}
      onResize={(e, { size }) => {
        setSize({ width: size.width, height: size.height });
      }}
      handle={(_, ref) => {
        return <Handle ref={ref} />;
      }}
    >
      {isActive ? (
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <VirtualizedLogList size={size} />
        </ErrorBoundary>
      ) : (
        <div
          className="flex h-full w-full cursor-pointer items-center justify-center text-sm text-white opacity-50 hover:opacity-100"
          onClick={() => setIsActive(true)}
        >
          <span>
            Game log is disabled.
            <br />
            Click HERE to enable.
          </span>
        </div>
      )}
    </ResizableBox>
  );
};
