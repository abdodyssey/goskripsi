import {
  UnstyledButton,
  Group,
  Avatar,
  Text,
  rem,
  Skeleton,
  Stack,
  Box,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import classes from "./UserButton.module.css";

import { forwardRef } from "react";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  mini?: boolean;
}

export const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ mini, ...props }, ref) => {
    const { userResponse, isLoadingProfile } = useAuth();

    if (isLoadingProfile) {
      return (
        <UnstyledButton className={classes.user} ref={ref} {...props}>
          <Group justify={mini ? "center" : "flex-start"} wrap="nowrap">
            <Skeleton height={38} circle />
            {!mini && (
              <Box style={{ flex: 1 }}>
                <Skeleton height={12} width="70%" mb={6} />
                <Skeleton height={8} width="40%" />
              </Box>
            )}
          </Group>
        </UnstyledButton>
      );
    }

    const user = userResponse?.user;
    const roles = user?.roles || userResponse?.roles || [];

    return (
      <UnstyledButton
        className={classes.user}
        ref={ref}
        data-mini={mini || undefined}
        {...props}
      >
        <Group
          justify={mini ? "center" : "flex-start"}
          wrap="nowrap"
          gap={mini ? 0 : "md"}
          w="100%"
          m={0}
          p={0}
        >
          <Avatar
            radius="xl"
            color="indigo"
            variant="filled"
            size={mini ? 38 : 40}
            className="border-2 border-white/10"
            m={0}
          >
            {user?.nama?.charAt(0) || "U"}
          </Avatar>

          {!mini && (
            <>
              <Stack gap={0} flex={1}>
                <Text size="sm" fw={700} lineClamp={1}>
                  {user?.nama || "Pengguna"}
                </Text>

                <Text
                  size="xs"
                  fw={500}
                  c="dimmed"
                  tt="capitalize"
                >
                  {roles[0] || "No Role"}
                </Text>
              </Stack>

              <IconChevronRight
                style={{
                  width: rem(14),
                  height: rem(14),
                }}
                stroke={1.5}
                color="gray"
              />
            </>
          )}
        </Group>
      </UnstyledButton>
    );
  },
);

UserButton.displayName = "UserButton";
