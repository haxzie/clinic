import { IconProps } from "./icons.types";

export default function ChevronRightIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill={color} d="M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z" />
    </svg>
  );
}
