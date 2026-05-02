import { Badge, MantineSize } from "@mantine/core";
import React from "react";

export type AcademicStatus =
  | "aktif"
  | "cuti"
  | "alumni"
  | "drop out"
  | "lulus"
  | "menunggu"
  | "disetujui"
  | "ditolak"
  | "proses";

interface StatusBadgeProps {
  status: AcademicStatus | string | undefined | null;
  size?: MantineSize;
  className?: string;
  style?: React.CSSProperties;
}

const getStatusConfig = (
  status?: string | null,
): { color: string; label: string } => {
  if (!status) return { color: "var(--gs-text-muted)", label: "-" };
  const s = status.toLowerCase();
  switch (s) {
    case "aktif":
    case "disetujui":
    case "diterima":
    case "lulus":
      return { color: "var(--gs-success)", label: status };
    case "menunggu":
    case "proses":
      return { color: "var(--gs-info)", label: status };
    case "revisi":
      return { color: "var(--gs-warning)", label: status };
    case "ditolak":
    case "drop out":
      return { color: "var(--gs-danger)", label: status };
    case "cuti":
    case "alumni":
      return { color: "var(--gs-text-secondary)", label: status };
    default:
      return { color: "var(--gs-text-muted)", label: status };
  }
};

export function StatusBadge({
  status,
  size = "sm",
  className,
  style,
}: StatusBadgeProps) {
  const { color, label } = getStatusConfig(status);

  const isDesaturated = color.startsWith("var(--gs-");
  const bgVar = isDesaturated ? color.replace(")", "-bg)") : "var(--gs-bg-overlay)";
  const borderVar = isDesaturated ? color.replace(")", "-border)") : "var(--gs-border)";
  const textVar = isDesaturated ? color.replace(")", "-text)") : "var(--gs-text-secondary)";

  return (
    <Badge
      variant="filled"
      size={size}
      className={className}
      radius="xl"
      fw={700}
      tt="uppercase"
      px={12}
      h={22}
      fz={10}
      lts={0.5}
      style={{
        backgroundColor: bgVar,
        color: textVar,
        border: `1px solid ${borderVar}`,
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...style,
      }}
    >
      {label}
    </Badge>
  );
}
