import React, { useState } from "react";
import styles from "./RequestProperties.module.scss";
import HeadersEditor from "./headers-editor/HeadersEditor";
import ParamsEditor from "./params-editor/ParamsEditor";
import RequestBodyEditor from "./request-body-editor/RequestBodyEditor";
import DetailsEditor from "./details-editor/DetailsEditor";
import AuthorizationEditor from "./authorization-editor/AuthorizationEditor";
import { motion } from "motion/react";

export enum Tabs {
  description = "description",
  auth = "auth",
  headers = "headers",
  params = "params",
  body = "body",
}

export default function RequestProperties({ apiId }: { apiId: string }) {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.headers);
  const tabs: Record<
    Tabs,
    {
      id: Tabs;
      label: string;
      component: React.ComponentType<{ apiId: string; onTabChange?: (tab: Tabs) => void }>;
    }
  > = {
    [Tabs.description]: {
      id: Tabs.description,
      label: "Details",
      component: DetailsEditor,
    },
    [Tabs.headers]: {
      id: Tabs.headers,
      label: "Headers",
      component: HeadersEditor,
    },
    [Tabs.params]: {
      id: Tabs.params,
      label: "Params",
      component: ParamsEditor,
    },
    [Tabs.body]: {
      id: Tabs.body,
      label: "Body",
      component: RequestBodyEditor,
    },
    [Tabs.auth]: {
      id: Tabs.auth,
      label: "Authorization",
      component: AuthorizationEditor,
    },
  };

  const ActiveView = ({ tabId }: { tabId: Tabs }) => {
    const TabComponent = tabs[tabId].component;
    return <TabComponent apiId={apiId} onTabChange={setActiveTab} />;
  };

  return (
    <div className={styles.requestProperties}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          {Object.values(tabs).map((tab) => (
            <button
              key={tab.id}
              className={[
                activeTab === tab.id ? styles.active : "",
                styles.tab,
              ].join(" ")}
              onClick={() => setActiveTab(tab.id)}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeRequestTabIndicator"
                  className={styles.activeTabIndicator}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 35,
                  }}
                />
              )}
              <span className={styles.label}>{tab.label}</span>
              <span className={styles.contentIndicator}></span>
            </button>
          ))}
        </div>
        {/* <div className={styles.options}>
          <button className={styles.curlButton}>
            curl://
            <CopyIcon size={16} />
          </button>
        </div> */}
      </div>
      <div className={styles.tabView}>
        <ActiveView tabId={activeTab} />
      </div>
    </div>
  );
}
