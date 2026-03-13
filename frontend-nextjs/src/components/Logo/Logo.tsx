import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";

export function Logo({
  style,
  mini,
}: {
  style?: React.CSSProperties;
  mini?: boolean;
}) {
  return (
    <Group gap="xs" style={style} justify={mini ? "center" : "flex-start"}>
      <ThemeIcon variant="filled" color="indigo" size="lg" radius="md">
        <IconSchool size={20} />
      </ThemeIcon>
      {!mini && (
        <Text fw={800} size="xl" c="white">
          GoSkripsi
        </Text>
      )}
    </Group>
  );
}
