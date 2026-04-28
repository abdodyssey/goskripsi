import Image from "next/image";
import { Group, Text } from "@mantine/core";

export function Logo({
  style,
  mini,
}: {
  style?: React.CSSProperties;
  mini?: boolean;
}) {
  return (
    <Group gap="xs" style={style} justify={mini ? "center" : "flex-start"}>
      <Image
        src="/uin-logo.png"
        alt="UIN Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      {!mini && (
        <Text fw={800} size="xl" className="text-slate-100">
          GoSkripsi
        </Text>
      )}
    </Group>
  );
}
