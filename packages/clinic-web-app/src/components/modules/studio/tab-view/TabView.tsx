import React from "react";
import styles from "./TabView.module.scss";
import IconButton from "@/components/base/icon-button/IconButton";
import ClearIcon from "@/components/icons/ClearIcon";
import AddIcon from "@/components/icons/AddIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import LinkIcon from "@/components/icons/LinkIcon";
import VariableIcon from "@/components/icons/VariableIcon";
import useEditorStore from "@/store/editor-store/editor.store";
import { useShallow } from "zustand/shallow";
import { TabRegistry } from "./TabRegistry";
import { TabType } from "@/store/editor-store/editor.types";
import WelcomeScreen from "../welcome-screen/WelcomeScreen";

export default function TabView() {
  const { activeTab, tabs, setActiveTab, removeTab, createTab } =
    useEditorStore(
      useShallow(({ activeTab, tabs, setActiveTab, removeTab, createTab }) => ({
        activeTab,
        tabs,
        setActiveTab,
        removeTab,
        createTab,
      }))
    );

  const ActiveTab = ({ tabId }: { tabId: string | null }) => {
    console.log(tabId);
    if (!tabId) return <WelcomeScreen />;
    const TabComponent = TabRegistry[tabs[tabId].type].component;
    console.log(TabComponent);
    return <TabComponent tab={tabs[tabId]} />;
  };

  const handleCreateNewRestTab = () => {
    createTab({
      name: "Untitled API",
      type: TabType.REST,
      metadata: {},
    });
  };

  return (
    <div id="tab-view" className={styles.tabView}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          {Object.values(tabs).map((tab) => (
            <div
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <LinkIcon size={16} />
              <span>{tab.name}</span>
              <IconButton
                size="small"
                color="var(--color-font-light)"
                className={styles.iconButton}
                onClick={() => removeTab(tab.id)}
                tooltip="Close tab"
                tooltipPosition="bottom"
              >
                <ClearIcon size={16} />
              </IconButton>
            </div>
          ))}
          <IconButton
            size="small"
            className={styles.addTab}
            onClick={handleCreateNewRestTab}
            tooltip="Add new tab"
            tooltipPosition="bottom"
          >
            <AddIcon size={16} />
          </IconButton>
        </div>

        <div className={styles.options}>
          <button className={styles.envButton}>
            <VariableIcon size={18} />
            <span>Environment</span>
            <ChevronDownIcon size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <ActiveTab tabId={activeTab} />
      </div>
    </div>
  );
}
