import { readFileSync } from "node:fs";
import { join } from "node:path";

const geckoSvg = readFileSync(
  join(process.cwd(), "public", "mascot", "onboarding-2.svg"),
  "utf8",
);

const geckoDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  geckoSvg,
)}`;

export function AppIconArt() {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#ffffff",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <img
        src={geckoDataUrl}
        alt="Gecko mascot"
        style={{
          height: "88%",
          objectFit: "contain",
          width: "88%",
        }}
      />
    </div>
  );
}
