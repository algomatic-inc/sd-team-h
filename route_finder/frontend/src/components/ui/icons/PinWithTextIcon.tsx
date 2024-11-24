type PinWithTextIconProps = {
  /** Icon size in pixels */
  size?: number;
  pinText?: string;
};

export function PinWithTextIcon({
  size = 24,
  pinText,
}: PinWithTextIconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 1  11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
        fill="#D34B36"
        stroke="#B63828"
        strokeWidth={0.5}
      />
      <text
        x="12"
        y="13"
        textAnchor="middle"
        fontSize={size / 5}
        fill="white"
        fontWeight="normal"
      >
        {pinText}
      </text>
    </svg>
  );
}
