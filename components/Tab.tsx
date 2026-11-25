import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { TabItem } from "@/consts/tabs";

type Props = {
  tabs: TabItem[];
  activeTabIndex: number;
  setActiveTabIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const Tab = ({ tabs, activeTabIndex, setActiveTabIndex }: Props) => {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [tabWidth, setTabWidth] = useState(0);
  const [tabHeight, setTabHeight] = useState(0);
  const [tabOffsetLeft, setTabOffsetLeft] = useState(0);

  useEffect(() => {
    if (activeTabIndex === null) {
      return;
    }

    const setTabPosition = () => {
      const currentTab = tabsRef.current[activeTabIndex] as HTMLElement;
      setTabOffsetLeft(currentTab?.offsetLeft ?? 0);
      setTabWidth(currentTab?.clientWidth ?? 0);
      setTabHeight(currentTab?.clientHeight ?? 0);
    };

    setTabPosition();
  }, [activeTabIndex]);

  return (
    <div className="relative grid grid-cols-3 rounded-full bg-primary-50 p-1">
      <div
        style={{ left: tabOffsetLeft, width: tabWidth, height: tabHeight }}
        className="absolute bottom-0 left-0 top-1 rounded-full bg-white transition-all duration-300"
      />

      {tabs.map((tab, index) => {
        const isCurrent = activeTabIndex === index;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabsRef.current[index] = el;
            }}
            className={clsx(
              isCurrent ? "" : "text-primary-300 hover:text-primary-500",
              "z-10 flex items-center justify-center gap-2 rounded-full py-3 transition-all duration-200",
            )}
            onClick={() => setActiveTabIndex(index)}
          >
            <tab.icon className="h-5 w-5" />
            <h1
              className={clsx(
                isCurrent ? "font-medium" : "",
                "text-xs lg:text-sm",
              )}
            >
              {tab.name}
            </h1>
          </button>
        );
      })}
    </div>
  );
};
