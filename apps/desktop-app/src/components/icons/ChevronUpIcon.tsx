import { IconProps } from "./icons.types";

export default function ChevronUpIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={color}
        d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z"
      />
    </svg>
  );
}
