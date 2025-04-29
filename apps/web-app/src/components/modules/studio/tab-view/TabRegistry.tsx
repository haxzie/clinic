import { IconProps } from "@/components/icons/icons.types";
import { Tab, TabType } from "@/store/editor-store/editor.types";
import LinkIcon from "@/components/icons/LinkIcon";
import APIEditor from "../api-editor/APIEditor";

export interface TabComponentProps {
  tab: Tab;
}

export interface TabRegistrySchema {
  id: TabType;
  name: string;
  icon: React.ComponentType<IconProps>;
  component: React.ComponentType<TabComponentProps>;
}

export const TabRegistry: Record<TabType, TabRegistrySchema> = {
  [TabType.REST]: {
    id: TabType.REST,
    name: "REST API",
    icon: LinkIcon,
    component: APIEditor,
  },
};
