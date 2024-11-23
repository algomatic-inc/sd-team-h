import { IconProps } from "./IconProps";

/** Pin icon with question mark.
 * https://fonts.google.com/icons?icon.set=Material+Symbols&selected=Material+Symbols+Outlined:not_listed_location:FILL@0;wght@400;GRAD@0;opsz@40&icon.size=40&icon.color=%235f6368&icon.query=question */
export function QuestionPin({ size }: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size ?? "24px"}
      viewBox="0 -960 960 960"
      width={size ?? "24px"}
      fill="#5f6368"
    >
      <path d="M480-320q17 0 29.5-12.5T522-362q0-17-12.5-29.5T480-404q-17 0-29.5 12.5T438-362q0 17 12.5 29.5T480-320Zm-30-124h60q0-19 1.5-30t4.5-18q4-8 11.5-16.5T552-534q21-21 31.5-42t10.5-42q0-47-31-74.5T480-720q-41 0-72 23t-42 61l54 22q7-23 23-35.5t37-12.5q24 0 39 13t15 33q0 17-7.5 29.5T500-558q-17 14-27 25.5T458-510q-5 10-6.5 24.5T450-444Zm30 258q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
    </svg>
  );
}