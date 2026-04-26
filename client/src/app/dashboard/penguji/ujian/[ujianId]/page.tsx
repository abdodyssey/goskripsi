"use client";

import { useParams } from "next/navigation";
import { useUjian } from "@/features/ujian/hooks/use-ujian";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Tabs,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Loader,
  Badge,
  Alert,
  Container,
  Center,
} from "@mantine/core";
import {
  IconUserCheck,
  IconReportAnalytics,
  IconGavel,
} from "@tabler/icons-react";
import {} from "react";
import { AbsensiTab } from "@/features/ujian/components/execution/AbsensiTab";
import { PenilaianTab } from "@/features/ujian/components/execution/PenilaianTab";
import { KeputusanTab } from "@/features/ujian/components/execution/KeputusanTab";

interface PengujiUjian {
  id: number;
  dosenId: number;
  peran: string;
  hadir: boolean;
}

export default function UjianExecutionPage() {
  const params = useParams();
  const ujianId = params.ujianId as string;
  const { userResponse } = useAuth();
  const {
    useUjianById,
    useFormPenilaian,
    useKeputusanOptions,
    submitAbsensi,
    isSubmittingAbsensi,
    simpanDraftNilai,
    isSavingDraft,
    submitNilaiFinal,
    isSubmittingFinal,
    finalisasiNilai,
    isFinalizing,
    submitKeputusan,
    isSubmittingKeputusan,
  } = useUjian();

  const {
    data: ujianData,
    isLoading: isLoadingUjian,
    isError: isErrorUjian,
  } = useUjianById(ujianId);

  const {
    data: formRes,
    isLoading: isLoadingForm,
    isError: isErrorForm,
  } = useFormPenilaian(ujianId);

  const {
    data: kepOptions,
    isLoading: isLoadingOptions,
    isError: isErrorOptions,
  } = useKeputusanOptions(ujianId);

  if (isLoadingUjian || isLoadingForm || isLoadingOptions) {
    return (
      <Center mih={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (isErrorUjian || isErrorForm || isErrorOptions) {
    return (
      <Container size="xl" py="lg">
        <Alert color="red" title="Gagal Memuat Data">
          Terjadi kesalahan saat mengambil data ujian. Pastikan Anda memiliki
          hak akses sebagai penguji.
        </Alert>
      </Container>
    );
  }

  if (!ujianData?.data || !formRes?.data) {
    return (
      <Container size="xl" py="lg">
        <Alert color="orange" title="Data Tidak Ditemukan">
          Data pelaksanaan ujian atau form penilaian tidak tersedia.
        </Alert>
      </Container>
    );
  }

  const ujian = ujianData.data;
  const currentUserId = userResponse?.user?.user_id || userResponse?.user?.id;
  const me = ujian.pengujiUjians.find(
    (p: PengujiUjian) => p.dosenId === Number(currentUserId),
  );

  if (!me) {
    return (
      <Alert color="red">
        Anda tidak terdaftar sebagai penguji pada ujian ini (ID: {currentUserId}
        ).
      </Alert>
    );
  }

  const isKetua = me.peran === "ketua_penguji";
  const isSekretaris = me.peran === "sekretaris_penguji";
  const sekeretarisPengechecks = ujian.pengujiUjians.find(
    (p: PengujiUjian) => p.peran === "sekretaris_penguji",
  );
  const canInputKeputusan =
    isSekretaris ||
    (isKetua && (!sekeretarisPengechecks || !sekeretarisPengechecks.hadir));

  return (
    <Container size="xl" py="lg">
      <Stack gap="xl">
        <Paper withBorder p="xl" radius="md">
          <Group justify="space-between">
            <Stack gap={0}>
              <Title order={2}>
                {ujian.pendaftaranUjian.jenisUjian.namaJenis}
              </Title>
              <Text c="dimmed" size="lg">
                Mahasiswa: {ujian.pendaftaranUjian.mahasiswa.user.nama} (
                {ujian.pendaftaranUjian.mahasiswa.nim})
              </Text>
              <Text size="sm" mt="xs" fw={500}>
                Judul: &quot;
                {ujian.pendaftaranUjian.rancanganPenelitian.judulPenelitian}
                &quot;
              </Text>
            </Stack>
            <Badge
              size="xl"
              variant="filled"
              color={ujian.status === "selesai" ? "green" : "indigo"}
            >
              {ujian.status.toUpperCase()}
            </Badge>
          </Group>
        </Paper>

        <Tabs
          defaultValue={isKetua ? "absensi" : "penilaian"}
          color="indigo"
          variant="outline"
          radius="md"
        >
          <Tabs.List>
            {isKetua && (
              <Tabs.Tab
                value="absensi"
                leftSection={<IconUserCheck size={16} />}
              >
                Absensi
              </Tabs.Tab>
            )}
            <Tabs.Tab
              value="penilaian"
              leftSection={<IconReportAnalytics size={16} />}
            >
              Penilaian
            </Tabs.Tab>
            {canInputKeputusan && (
              <Tabs.Tab value="keputusan" leftSection={<IconGavel size={16} />}>
                Keputusan
              </Tabs.Tab>
            )}
          </Tabs.List>

          {isKetua && (
            <Tabs.Panel value="absensi" pt="xl">
              <AbsensiTab
                ujian={ujian}
                onSubmit={async (list) => {
                  await submitAbsensi({ id: ujianId, absensiList: list });
                }}
                isSubmitting={isSubmittingAbsensi}
              />
            </Tabs.Panel>
          )}

          <Tabs.Panel value="penilaian" pt="xl">
            <PenilaianTab
              formData={formRes.data}
              ujian={ujian}
              isKetua={isKetua}
              onSaveDraft={async (list) => {
                await simpanDraftNilai({ id: ujianId, penilaianList: list });
              }}
              onSubmitFinal={async (list) => {
                await submitNilaiFinal({ id: ujianId, penilaianList: list });
              }}
              onFinalize={async () => {
                await finalisasiNilai(ujianId);
              }}
              isSaving={isSavingDraft}
              isSubmitting={isSubmittingFinal}
              isFinalizing={isFinalizing}
            />
          </Tabs.Panel>

          {canInputKeputusan && (
            <Tabs.Panel value="keputusan" pt="xl">
              <KeputusanTab
                ujian={ujian}
                options={kepOptions?.data || []}
                onSubmit={async (payload) => {
                  await submitKeputusan({ id: ujianId, payload });
                }}
                isSubmitting={isSubmittingKeputusan}
              />
            </Tabs.Panel>
          )}
        </Tabs>
      </Stack>
    </Container>
  );
}
