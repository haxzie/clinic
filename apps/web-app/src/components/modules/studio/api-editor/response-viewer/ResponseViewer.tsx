import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./ResponseViewer.module.scss";
import ResponseStatusBar from "./response-status-bar/ResponseStatusBar";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import ResponseHeaders from "./response-headers/ResponseHeaders";
import ContentEditor from "@/components/modules/studio/content-editor/ContentEditor";
import useApiStore from "@/store/api-store/api.store";
import { useShallow } from "zustand/shallow";
import EmptyResponse from "./empty-response/EmptyResponse";
import { downloadFile } from "@/utils/fileUtils";
import ResponseBodyTopBar from "./response-body-top-bar/ResponseBodyTopBar";
import NProgress from "./nprogress/NProgress";

export default function ResponseViewer({ apiId }: { apiId: string }) {
  const [isPanelHidden, setIsPanelHidden] = useState(false);
  const panelRef = useRef<ImperativePanelHandle | null>(null);

  const setPanelSize = (size: number) => {
    if (panelRef.current) {
      panelRef.current.resize(size);
    }
  };

  const { response, isLoading } = useApiStore(
    useShallow((state) => ({
      response: state.apis[apiId].response,
      isLoading: state.apis[apiId].isLoading,
    }))
  );

  const formattedResponse = useMemo(() => {
    if (response?.contentType === "application/json" && response?.content && response.content.trim()) {
      try {
        const data = JSON.parse(response.content);
        return JSON.stringify(data, null, 2);
      } catch (error) {
        console.error("Error parsing JSON", error);
        return response?.content;
      }
    }
    return response?.content || '';
  }, [response]);

  const handleResponseDownload = () => {
    if (response) {
      switch (response.contentType) {
        case "application/json":
          downloadFile("response.json", response.content, response.contentType);
          break;
        case "application/xml":
          downloadFile("response.xml", response.content, response.contentType);
          break;
        case "text/html":
          downloadFile("response.html", response.content, response.contentType);
          break;
        case "image/png":
        case "image/jpeg":
        case "image/gif":
          downloadFile(
            `response.${response.contentType.split("/")[1]}`,
            response.content,
            response.contentType
          );
          break;
        default:
          downloadFile(
            "response.txt",
            response.content,
            response.contentType || "text/plain"
          );
      }
    }
  };

  const handleResponseCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response.content);
    }
  };

  /**
   * Handle the resize of the panel
   * if the height is greater than 0 and the panel is hidden, set show the panel
   * if the height is 0 and the panel is not hidden, set hide the panel
   * @param height The height of the panel
   */
  const handleResize = useCallback(
    (height: number) => {
      if (height > 0 && isPanelHidden) {
        setIsPanelHidden(false);
      } else if (height === 0 && !isPanelHidden) {
        setIsPanelHidden(true);
      }
    },
    [isPanelHidden]
  );

  /**
   * Toggle the panel visibility
   * if the panel is hidden, show the panel
   * if the panel is not hidden, hide the panel
   */
  const handleTogglePanel = useCallback(() => {
    if (isPanelHidden) {
      setPanelSize(50);
      setIsPanelHidden(false);
    } else {
      setPanelSize(0);
      setIsPanelHidden(true);
    }
  }, [isPanelHidden]);

  useEffect(() => {
    if (panelRef.current && panelRef.current.getSize() === 0) {
      setPanelSize(50);
    }
  }, [response]);

  return (
    <>
      <PanelResizeHandle />
      {/* This is outside the panel to avoid the panel from being hidden */}
      {response && (
        <ResponseStatusBar
          status={response.statusCode}
          time={response.performance?.duration}
          isPanelHidden={isPanelHidden}
          onClickTogglePanel={handleTogglePanel}
        />
      )}
      <Panel
        minSize={0}
        ref={panelRef}
        onResize={handleResize}
        className={styles.responseViewer}
      >
        <NProgress active={isLoading} />
        {response ? (
          <PanelGroup direction="horizontal" className={styles.responseArea}>
            <Panel defaultSize={70} className={styles.viewerContent}>
              <ResponseBodyTopBar
                responseType={response.contentType || ""}
                size={response.performance?.transferSize}
                onClickCopy={handleResponseCopy}
                onClickDownload={handleResponseDownload}
              />
              <ContentEditor editable={false} value={formattedResponse} />
            </Panel>

            <PanelResizeHandle />
            <ResponseHeaders
              performance={response.performance}
              headers={response.headers}
            />
          </PanelGroup>
        ) : (
          <EmptyResponse />
        )}
      </Panel>
    </>
  );
}
