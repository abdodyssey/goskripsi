import React, { useState, useEffect } from "react";
import { Box, Image, Loader, Text } from "@mantine/core";
import { apiClient } from "@/lib/api-client";

interface SignaturePreviewProps {
  url?: string | null;
  alt?: string;
  height?: number | string;
  width?: number | string;
  placeholderText?: string;
}

/**
 * SignaturePreview: A reusable component to safely display digital signatures.
 * Automatically fetches a signed URL from the backend to bypass private storage restrictions.
 */
export function SignaturePreview({
  url,
  alt = "Signature",
  height = 80,
  width = "auto",
  placeholderText = "Belum ada tanda tangan",
}: SignaturePreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!url) {
        setSignedUrl(null);
        return;
      }

      // If it's already a data URL or a non-authenticated URL, we might not need a signed URL
      // But for consistency with our storage policy, we usually route through backend
      if (url.startsWith("data:")) {
        setSignedUrl(url);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        // Extract path from the full authenticated URL if necessary
        const parts = url.split("skripsi_docs/");
        const path = parts.length > 1 ? parts[1] : url;

        const response = await apiClient.post("/upload/signed-url", { path });

        if (response.data.success) {
          setSignedUrl(response.data.signedUrl);
        } else {
          throw new Error("Failed to get signed URL");
        }
      } catch (err) {
        console.error("Error fetching signed signature URL:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [url]);

  if (!url) {
    return (
      <Text size="xs" c="dimmed" fs="italic">
        {placeholderText}
      </Text>
    );
  }

  if (loading) {
    return (
      <Box h={height} style={{ display: "flex", alignItems: "center" }}>
        <Loader size="xs" />
      </Box>
    );
  }

  if (error) {
    return (
      <Text size="xs" c="red">
        Gagal memuat tanda tangan
      </Text>
    );
  }

  return (
    <Box
      style={{
        height,
        width,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {signedUrl && (
        <Image
          src={signedUrl}
          alt={alt}
          h={height}
          w={width}
          fit="contain"
          style={{ objectPosition: "left" }}
        />
      )}
    </Box>
  );
}
