import React, { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useEditorStore } from "@/store/editor-store/editor.store";
import { cn } from "@/utils/cn";
import styles from "./Tabs.module.scss";
import IconButton from "@/components/base/icon-button/IconButton";
import ClearIcon from "@/components/icons/ClearIcon";
import TabIcon from "./TabIcon";
import { AnimatePresence, motion } from "motion/react";
import useApiStore from "@/store/api-store/api.store";
import { TabTypes } from "@/store/editor-store/editor.types";
import TabName from "./TabName";
import AddIcon from "@/components/icons/AddIcon";

export default function Tabs() {
  const isInitialized = useRef(false);
  const { tabs, activeTab, tabOrder, setActiveTab, deleteTab,  } = useEditorStore(
    useShallow(({ tabs, activeTab, tabOrder, setActiveTab, deleteTab,  }) => ({
      tabs,
      activeTab,
      tabOrder,
      setActiveTab,
      deleteTab,
    }))
  );

  const handleAddTab = useCallback(() => {
    const APIId = useApiStore.getState().createAPI({});
    useEditorStore.getState().createTab({
      id: APIId,
      type: TabTypes.API,
    });
  }, []);

  const showDividers = useCallback(
    (index: number) => {
      return !(
        // hidden for active tab
        (
          tabOrder[index] === activeTab ||
          // hide divider if the tab is adjacent to the active tab
          tabOrder[index + 1] === activeTab ||
          // hide divider if the tab is the last tab
          index === tabOrder.length - 1
        )
      );
    },
    [tabOrder, activeTab]
  );

  // During the initial render if there are no tabs, we need to create a default tab
  useEffect(() => {
    if (tabOrder.length === 0 && !isInitialized.current) {
      handleAddTab();
      isInitialized.current = true;
    }
  }, [tabOrder.length, handleAddTab]);

  return (
    <div className={styles.tabWrapper}>
      {tabOrder.length > 0 && (
        <div className={styles.tabs}>
          <AnimatePresence>
            {tabOrder.map((tabId, index) => {
              return (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  layout
                  className={styles.tabContainer}
                  key={tabId}
                >
                  <div
                    className={cn(
                      styles.tab,
                      activeTab === tabId && styles.activeTab
                    )}
                    onClick={() => setActiveTab(tabId)}
                  >
                    <TabIcon tab={tabs[tabId]} />
                    <TabName tab={tabs[tabId]} />
                    <IconButton
                      className={styles.closeButton}
                      onClick={() => deleteTab(tabId)}
                    >
                      <ClearIcon size={18} />
                    </IconButton>
                  </div>

                  <div
                    className={cn(
                      styles.tabSeparator,
                      !showDividers(index) && styles.hide
                    )}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <IconButton className={styles.addTabButton} onClick={handleAddTab}>
        <AddIcon size={16} />
      </IconButton>
    </div>
  );
}
