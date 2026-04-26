"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Stack, Skeleton, Alert } from "@mantine/core";
import { IconEdit, IconInfoCircle } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PerbaikanJudulList } from "@/features/ranpel/components/perbaikan-judul-list";
import { useRanpelByMahasiswa } from "@/features/ranpel/hooks/use-ranpel";
import { useMemo } from "react";

export default function PerbaikanJudulPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const mahasiswaId = String(userResponse?.user?.id || "");
  
  const { pengajuanList, isLoading: isLoadingRanpel } = useRanpelByMahasiswa(mahasiswaId);

  const currentTitle = useMemo(() => {
    if (!pengajuanList) return "";
    const list = Array.isArray(pengajuanList) ? pengajuanList : [pengajuanList];
    const accepted = list.find(p => p.statusKaprodi === "diterima");
    return accepted?.rancanganPenelitian?.judulPenelitian || "";
  }, [pengajuanList]);

  if (isLoadingProfile || !isAuthenticated) return null;

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Perbaikan Judul"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Perbaikan Judul" },
        ]}
        description="Ajukan perubahan judul penelitian setelah mendapatkan persetujuan"
        icon={IconEdit}
      />

      <Stack mt="xl">
        {isLoadingRanpel ? (
          <Skeleton height={200} radius="lg" />
        ) : !currentTitle ? (
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" radius="lg">
            Anda belum memiliki judul penelitian yang disetujui. Silakan selesaikan pengajuan Rancangan Penelitian (Ranpel) terlebih dahulu.
          </Alert>
        ) : (
          <PerbaikanJudulList currentTitle={currentTitle} />
        )}
      </Stack>
    </Container>
  );
}
