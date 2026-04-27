import { Badge, MantineColor, MantineSize } from "@mantine/core";
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
): { color: MantineColor; label: string } => {
  if (!status) return { color: "gray", label: "-" };
  const s = status.toLowerCase();
  switch (s) {
    case "aktif":
    case "disetujui":
    case "diterima":
    case "lulus":
      return { color: "teal", label: status };
    case "menunggu":
    case "proses":
      return { color: "indigo", label: status };
    case "revisi":
      return { color: "orange", label: status };
    case "ditolak":
    case "drop out":
      return { color: "red", label: status };
    case "cuti":
    case "alumni":
      return { color: "slate", label: status };
    default:
      return { color: "gray", label: status };
  }
};

export function StatusBadge({
  status,
  size = "sm",
  className,
  style,
}: StatusBadgeProps) {
  const { color, label } = getStatusConfig(status);

  return (
    <Badge
      variant="light"
      color={color}
      size={size}
      className={className}
      radius="xl"
      fw={800}
      tt="uppercase"
      px={12}
      h={24}
      fz={10}
      style={{
        border: "1px solid",
        borderColor: "var(--mantine-color-" + color + "-light-hover)",
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...style,
      }}
    >
      {label}
    </Badge>
  );
}
