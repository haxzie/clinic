import React from "react";
import GetIcon from "./GetIcon";
import PostIcon from "./PostIcon";
import PutIcon from "./PutIcon";
import DeleteIcon from "./DeleteIcon";
import PatchIcon from "./PatchIcon";
import OptionsIcon from "./OptionsIcon";
import HeadIcon from "./HeadIcon";
import { IconProps } from "../icons.types";
import GraphQlIcon from "./GraphQlIcon";

export interface RequestIconProps {
  size?: number;
  method?: string;
}

export const Requests: Record<
  string,
  {
    color: string;
    backgroundColor: string;
    icon: React.ComponentType<IconProps>;
  }
> = {
  GET: {
    color: "#46d326",
    backgroundColor: "#46d3261a",
    icon: GetIcon,
  },
  POST: {
    color: "#4b8fff",
    backgroundColor: "#4b8fff1a",
    icon: PostIcon,
  },
  PUT: {
    color: "#e8aa1b",
    backgroundColor: "#e8aa1b1a",
    icon: PutIcon,
  },
  DELETE: {
    color: "#f25b2d",
    backgroundColor: "#f25b2d1a",
    icon: DeleteIcon,
  },
  PATCH: {
    color: "#9f92ff",
    backgroundColor: "#9f92ff1a",
    icon: PatchIcon,
  },
  OPTIONS: {
    color: "#56c0e1",
    backgroundColor: "#56c0e11a",
    icon: OptionsIcon,
  },
  HEAD: {
    color: "#bdf22d",
    backgroundColor: "#bdf22d1a",
    icon: HeadIcon,
  },
  GRAPHQL: {
    color: "#9f92ff",
    backgroundColor: "#9f92ff1a",
    icon: GraphQlIcon,
  },
};

export default function RequestIcon({
  size = 24,
  method = "GET",
}: RequestIconProps) {
  const Icon = Requests[method].icon;

  return (
    <div
      style={{
        backgroundColor: Requests[method].backgroundColor,
        padding: 4,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={size} color={Requests[method].color} />
    </div>
  );
}
