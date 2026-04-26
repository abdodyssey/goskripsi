"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader, Text, Alert, ActionIcon, Group, Tooltip } from "@mantine/core";
import {
  IconExternalLink,
  IconLock,
  IconFileDescription,
} from "@tabler/icons-react";
import axios from "axios";

interface SecureFileViewerProps {
  filePath: string; // e.g., 'submissions/12345/thesis.pdf'
  label?: string;
}

/**
 * SecureFileViewer: Fetches a Signed URL from the backend and provides access.
 * Implements short-lived URLs (60s) for private academic documents.
 */
export const SecureFileViewer: React.FC<SecureFileViewerProps> = ({
  filePath,
  label,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/upload/signed-url`,
        { path: filePath },
        { withCredentials: true },
      );

      if (response.data.success) {
        setSignedUrl(response.data.signedUrl);
      } else {
        throw new Error("Failed to generate access link.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  useEffect(() => {
    if (filePath) {
      fetchUrl();
    }
  }, [filePath, fetchUrl]);

  if (loading) {
    return (
      <Group gap="xs">
        <Loader size="xs" color="indigo" />
        <Text size="xs" c="dimmed">
          Authorizing access...
        </Text>
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="red" variant="light" py="xs" icon={<IconLock size={14} />}>
        <Text size="xs">{error}</Text>
      </Alert>
    );
  }

  return (
    <Group
      justify="space-between"
      p="xs"
      style={{ border: "1px solid #eee", borderRadius: 8 }}
    >
      <Group gap="sm">
        <IconFileDescription size={20} color="gray" />
        <Text size="sm" fw={500}>
          {label || "Private Document"}
        </Text>
      </Group>

      <Tooltip label="Open Private File (Link expires in 60s)">
        <ActionIcon
          component="a"
          href={signedUrl || "#"}
          target="_blank"
          variant="light"
          color="indigo"
          disabled={!signedUrl}
        >
          <IconExternalLink size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};
