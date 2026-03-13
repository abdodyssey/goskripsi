"use client";

import {
  Table,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Badge,
  Paper,
  Title,
  Box,
  Accordion,
} from "@mantine/core";
import { IconLock, IconDeviceFloppy, IconSend } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { modals } from "@mantine/modals";

interface PenilaianItem {
  komponenPenilaianId: number;
  kriteria: string;
  nilai: number;
  komentar?: string;
  bobot: number;
}

interface PengujiUjian {
  dosenId: number;
  peran: string;
  hadir: boolean;
  dosen: { id: number; user: { nama: string } };
}

interface ComponentDetail {
  id: number;
  kriteria: string;
  penilaians: { nilai: number; komentar: string }[];
  bobotKomponenPerans?: { peran: string; bobot: number }[];
}

interface ScoreDetail {
  dosenId: number;
  komponenPenilaianId: number;
  nilai: number | string;
  sudahSubmit: boolean;
  dosen: { id: number; user: { nama: string } };
  komponenPenilaian: {
    kriteria: string;
    bobotKomponenPerans?: { peran: string; bobot: number }[];
  };
}

interface GroupedScoreEntry {
  dosen: { id: number; user: { nama: string } };
  scores: ScoreDetail[];
  isFinal: boolean;
  totalNilai: number;
  totalBobot: number;
}

interface PenilaianTabProps {
  formData: {
    sudahSubmit: boolean;
    components: ComponentDetail[];
    allScores: ScoreDetail[];
    penguji: {
      dosenId: number;
      dosen: { id: number; user: { nama: string } };
    };
    ujian: { nilaiDifinalisasi: boolean };
  };
  onSaveDraft: (
    list: { dosenId?: number; komponenPenilaianId: number; nilai: number }[],
  ) => Promise<void>;
  onSubmitFinal: (
    list: { dosenId?: number; komponenPenilaianId: number; nilai: number }[],
  ) => Promise<void>;
  onFinalize: () => Promise<void>;
  isSaving: boolean;
  isSubmitting: boolean;
  isFinalizing: boolean;
  isKetua: boolean;
  ujian: {
    pengujiUjians: PengujiUjian[];
  };
}

export function PenilaianTab({
  formData,
  onSaveDraft,
  onSubmitFinal,
  onFinalize,
  isSaving,
  isSubmitting,
  isFinalizing,
  isKetua,
  ujian,
}: PenilaianTabProps) {
  const [scores, setScores] = useState<PenilaianItem[]>(() => {
    return (
      formData?.components?.map((c) => ({
        komponenPenilaianId: c.id,
        kriteria: c.kriteria,
        nilai: Number(c.penilaians[0]?.nilai) || 0,
        komentar: c.penilaians[0]?.komentar || "",
        bobot: c.bobotKomponenPerans?.[0]?.bobot || 0,
      })) || []
    );
  });
  const [globalScores, setGlobalScores] = useState<ScoreDetail[]>(
    formData?.allScores || [],
  );

  const isAlreadyFinal = formData?.sudahSubmit;
  const isFinalized = formData?.ujian?.nilaiDifinalisasi;

  // Sync if formData changes (e.g. after save/refetch)
  const [prevComponents, setPrevComponents] = useState(formData?.components);
  const [prevAllScores, setPrevAllScores] = useState(formData?.allScores);

  if (formData?.components !== prevComponents) {
    setPrevComponents(formData.components);
    const mapped =
      formData.components?.map((c) => ({
        komponenPenilaianId: c.id,
        kriteria: c.kriteria,
        nilai: Number(c.penilaians[0]?.nilai) || 0,
        komentar: c.penilaians[0]?.komentar || "",
        bobot: c.bobotKomponenPerans?.[0]?.bobot || 0,
      })) || [];
    setScores(mapped);
  }

  if (formData?.allScores !== prevAllScores) {
    setPrevAllScores(formData.allScores);
    setGlobalScores(formData.allScores || []);
  }

  const handleGlobalScoreUpdate = (
    dosenId: number,
    komponenId: number,
    val: number,
  ) => {
    if (isFinalized) return;
    setGlobalScores((prev) =>
      prev.map((s) =>
        s.dosenId === dosenId && s.komponenPenilaianId === komponenId
          ? { ...s, nilai: val }
          : s,
      ),
    );

    // Sync with local 'scores' if it's the current user's score being edited
    if (formData.penguji?.dosenId === dosenId) {
      setScores((prev) =>
        prev.map((s) =>
          s.komponenPenilaianId === komponenId ? { ...s, nilai: val } : s,
        ),
      );
    }
  };

  const handleScoreChange = (id: number, val: number | string) => {
    const numericVal = Number(val);
    if (isFinalized) return;
    if (isAlreadyFinal && !isKetua) return;

    setScores((prev) =>
      prev.map((s) =>
        s.komponenPenilaianId === id ? { ...s, nilai: numericVal } : s,
      ),
    );

    // If ketua, also sync to globalScores so the summary card update
    if (isKetua) {
      setGlobalScores((prev) => {
        const index = prev.findIndex(
          (s) =>
            s.dosenId === formData.penguji?.dosenId &&
            s.komponenPenilaianId === id,
        );
        if (index > -1) {
          const next = [...prev];
          next[index] = { ...next[index], nilai: numericVal };
          return next;
        } else {
          // If not in globalScores yet, add it
          const comp = formData.components?.find((c) => c.id === id);
          return [
            ...prev,
            {
              dosenId: formData.penguji?.dosenId,
              komponenPenilaianId: id,
              nilai: numericVal,
              sudahSubmit: false,
              kriteria: comp?.kriteria || "",
              bobot: comp?.bobotKomponenPerans?.[0]?.bobot || 0,
              dosen: formData.penguji?.dosen,
              komponenPenilaian: {
                id,
                kriteria: comp?.kriteria || "",
                bobotKomponenPerans: comp?.bobotKomponenPerans || [],
              },
            } as ScoreDetail,
          ];
        }
      });
    }
  };

  const getCalculationResult = () => {
    const scoresToUse =
      isKetua && globalScores.length > 0 ? globalScores : scores;
    if (scoresToUse.length === 0) return { average: 0, passes: false };

    let sumNilaiBobot = 0;
    let sumBobot = 0;
    let anyScoreUnder60 = false;

    // We need to know roles for each score to find the right bobot
    scoresToUse.forEach((s: ScoreDetail | PenilaianItem) => {
      // Find the examiner's role for this score
      const dId = "dosenId" in s ? s.dosenId : formData.penguji?.dosenId;
      const penguji = ujian.pengujiUjians.find((p) => p.dosenId === dId);
      const peran = penguji?.peran;

      const val = Number(s.nilai);

      // Get weight for this peran
      const comp =
        formData.components?.find((c) => c.id === s.komponenPenilaianId) ||
        ("komponenPenilaian" in s ? s.komponenPenilaian : undefined);
      const bobotData = comp?.bobotKomponenPerans?.find(
        (b) => b.peran === peran,
      );
      const bobot = bobotData?.bobot || 0;

      if (bobot > 0 && val < 60) anyScoreUnder60 = true;

      sumNilaiBobot += val * bobot;
      sumBobot += bobot;
    });

    const average = sumBobot > 0 ? sumNilaiBobot / sumBobot : 0;

    // Convert to Letter Grade
    let nilaiHuruf = "E";
    if (average >= 80) nilaiHuruf = "A";
    else if (average >= 70) nilaiHuruf = "B";
    else if (average >= 60) nilaiHuruf = "C";
    else if (average >= 56) nilaiHuruf = "D";

    // Minimal C (60) and no individual score under 60
    const lulusByGrade = ["A", "B", "C"].includes(nilaiHuruf);
    const passes = lulusByGrade && !anyScoreUnder60;

    return { average, passes, anyScoreUnder60 };
  };

  const handleSaveDraft = async () => {
    try {
      let payload;
      if (isKetua) {
        // Merge Chairperson's local scores with other examiners' scores from globalScores
        const myScores = scores.map((s) => ({
          dosenId: formData.penguji?.dosenId,
          komponenPenilaianId: s.komponenPenilaianId,
          nilai: Number(s.nilai),
        }));

        const otherScores = globalScores
          .filter((gs) => gs.dosenId !== formData.penguji?.dosenId)
          .map((gs) => ({
            dosenId: gs.dosenId,
            komponenPenilaianId: gs.komponenPenilaianId,
            nilai: Number(gs.nilai),
          }));

        payload = [...myScores, ...otherScores];
      } else {
        payload = scores.map((s) => ({
          komponenPenilaianId: s.komponenPenilaianId,
          nilai: s.nilai,
        }));
      }
      await onSaveDraft(payload);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const handleSubmitFinal = async () => {
    modals.openConfirmModal({
      title: "Konfirmasi Submit Nilai",
      children: (
        <>
          <Text size="sm">
            Apakah Anda yakin ingin mensubmit nilai final? Nilai tidak dapat
            diubah lagi sampai ketua melakukan finalisasi.
          </Text>
          {isKetua && (
            <Text fw={700} c="red" mt="xs">
              PENTING: Sebagai Ketua, Anda juga akan mensubmit nilai untuk
              seluruh penguji lainnya.
            </Text>
          )}
        </>
      ),
      labels: { confirm: "Ya, Submit", cancel: "Batal" },
      onConfirm: async () => {
        try {
          let payload;
          if (isKetua) {
            // Merge Chairperson's local scores with other examiners' scores from globalScores
            const myScores = scores.map((s) => ({
              dosenId: formData.penguji?.dosenId,
              komponenPenilaianId: s.komponenPenilaianId,
              nilai: Number(s.nilai),
            }));

            const otherScores = globalScores
              .filter((gs) => gs.dosenId !== formData.penguji?.dosenId)
              .map((gs) => ({
                dosenId: gs.dosenId,
                komponenPenilaianId: gs.komponenPenilaianId,
                nilai: Number(gs.nilai),
              }));

            payload = [...myScores, ...otherScores];
          } else {
            payload = scores.map((s) => ({
              komponenPenilaianId: s.komponenPenilaianId,
              nilai: s.nilai,
            }));
          }
          await onSubmitFinal(payload);
        } catch (error: unknown) {
          console.error(error);
        }
      },
    });
  };

  const handleFinalize = async () => {
    modals.openConfirmModal({
      title: "Finalisasi Nilai",
      children: (
        <Text size="sm">
          Setelah difinalisasi, nilai semua penguji tidak dapat diubah lagi.
          Lanjutkan?
        </Text>
      ),
      labels: { confirm: "Ya, Finalisasi", cancel: "Batal" },
      onConfirm: async () => {
        try {
          await onFinalize();
        } catch (error: unknown) {
          console.error(error);
        }
      },
    });
  };

  const groupedScores = useMemo(() => {
    const scoresToGroup = isKetua ? globalScores : formData?.allScores || [];
    const acc: Record<number, GroupedScoreEntry> = {};

    // Initialize with all assigned examiners to ensure they show up even with 0 scores
    ujian.pengujiUjians.forEach((p) => {
      acc[p.dosenId] = {
        dosen: p.dosen,
        scores: [],
        isFinal: false,
        totalNilai: 0,
        totalBobot: 0,
      };
    });

    scoresToGroup.forEach((score) => {
      const dId = score.dosenId;
      if (!acc[dId]) {
        // Fallback for unexpected data
        acc[dId] = {
          dosen: score.dosen,
          scores: [],
          isFinal: score.sudahSubmit,
          totalNilai: 0,
          totalBobot: 0,
        };
      }

      acc[dId].scores.push(score);
      acc[dId].isFinal = score.sudahSubmit;

      const penguji = ujian.pengujiUjians.find((p) => p.dosenId === dId);
      const bobot =
        score.komponenPenilaian.bobotKomponenPerans?.find(
          (b) => b.peran === penguji?.peran,
        )?.bobot || 0;

      acc[dId].totalNilai += Number(score.nilai) * (bobot / 100);
      acc[dId].totalBobot += bobot;
    });

    return acc;
  }, [isKetua, globalScores, formData?.allScores, ujian.pengujiUjians]);

  return (
    <Stack gap="xl">
      {isFinalized && (
        <Alert
          icon={<IconLock size={20} />}
          title="Sesi Penilaian Terkunci"
          color="red"
          variant="filled"
          radius="md"
        >
          Nilai telah difinalisasi oleh Ketua Penguji dan tidak dapat diubah
          lagi.
        </Alert>
      )}

      {/* Main Stats Summary for Chairperson */}
      {formData?.allScores && (
        <Group grow align="stretch">
          <Paper withBorder p="lg" radius="md">
            <Stack gap="xs">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="1px">
                Progres Penilaian
              </Text>
              <Group justify="space-between" align="flex-end">
                <Title order={2}>
                  {
                    Object.values(groupedScores).filter(
                      (g: GroupedScoreEntry) =>
                        g.isFinal || g.scores.length > 0,
                    ).length
                  }
                  <Text span size="xl" c="dimmed" fw={500}>
                    {" "}
                    / {ujian.pengujiUjians.length}
                  </Text>
                </Title>
                <Text size="sm" c="blue" fw={500}>
                  Penguji Telah Submit
                </Text>
              </Group>
            </Stack>
          </Paper>

          <Paper withBorder p="lg" radius="md" bg="indigo.0">
            <Stack gap="xs">
              <Text size="xs" fw={700} c="indigo.8" tt="uppercase" lts="1px">
                Nilai Akhir
              </Text>
              <Group justify="space-between" align="flex-end">
                <Title order={1} c="indigo.9">
                  {Number(getCalculationResult().average || 0).toFixed(2)}
                </Title>
                {isFinalized && (
                  <Badge
                    size="lg"
                    variant="filled"
                    color={getCalculationResult().passes ? "green" : "red"}
                  >
                    {getCalculationResult().passes ? "LULUS" : "TIDAK LULUS"}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>
        </Group>
      )}

      {isFinalized &&
        getCalculationResult().average >= 60 &&
        !getCalculationResult().passes && (
          <Alert color="red" radius="md" title="Kriteria Tidak Terpenuhi">
            Meskipun rata-rata memenuhi syarat, terdapat kriteria penilaian
            individu yang berada di bawah nilai minimal (60). Sesuai ketentuan,
            mahasiswa dinyatakan tidak lulus.
          </Alert>
        )}

      {/* My Input Section */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Box
          bg="gray.0"
          py="md"
          px="xl"
          style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
        >
          <Group justify="space-between">
            <Title order={4} c="gray.8">
              Lembar Penilaian Anda
            </Title>
            {isAlreadyFinal ? (
              <Badge
                color="green"
                size="lg"
                variant="light"
                leftSection={<IconSend size={14} />}
              >
                Sudah Disubmit
              </Badge>
            ) : (
              <Badge color="orange" size="lg" variant="light">
                Draf Sedang Diisi
              </Badge>
            )}
          </Group>
        </Box>

        <Box p="xl">
          <Table verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: "var(--mantine-color-dimmed)" }}>
                  KOMPONEN
                </Table.Th>
                <Table.Th
                  w={100}
                  style={{ color: "var(--mantine-color-dimmed)" }}
                >
                  BOBOT
                </Table.Th>
                <Table.Th
                  w={180}
                  style={{ color: "var(--mantine-color-dimmed)" }}
                >
                  SKOR (0-100)
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {scores.map((s) => (
                <Table.Tr key={s.komponenPenilaianId}>
                  <Table.Td>
                    <Text fw={600} size="sm">
                      {s.kriteria}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="dot" color="indigo" size="sm">
                      {s.bobot}%
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={s.nilai}
                      onChange={(val) =>
                        handleScoreChange(s.komponenPenilaianId, val)
                      }
                      min={0}
                      max={100}
                      size="sm"
                      variant={
                        isFinalized || (isAlreadyFinal && !isKetua)
                          ? "filled"
                          : "default"
                      }
                      disabled={
                        isFinalized ||
                        (isAlreadyFinal && !isKetua) ||
                        isSubmitting ||
                        isSaving
                      }
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {(!isAlreadyFinal || isKetua) && !isFinalized && (
            <Group
              justify="flex-end"
              mt="xl"
              pt="xl"
              style={{ borderTop: "1px dashed var(--mantine-color-gray-3)" }}
            >
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconDeviceFloppy size={18} />}
                loading={isSaving}
                onClick={handleSaveDraft}
              >
                Simpan Draf
              </Button>
              <Button
                color="indigo"
                radius="md"
                px="xl"
                leftSection={<IconSend size={18} />}
                loading={isSubmitting}
                onClick={handleSubmitFinal}
              >
                Submit Nilai Sekarang
              </Button>
            </Group>
          )}
        </Box>
      </Paper>

      {/* Rekapitulasi - Grouped by Examiner */}
      {formData?.allScores && (
        <Stack gap="md">
          <Title order={4} px="xs" c="gray.7">
            Detail Penilaian Tim Penguji
          </Title>
          <Accordion variant="separated" radius="md">
            {Object.entries(groupedScores).map(([dosenId, group]) => {
              const penguji = ujian.pengujiUjians.find(
                (p) => p.dosenId === Number(dosenId),
              );
              const label =
                penguji?.peran.replace(/_/g, " ").toUpperCase() || "PENGUJI";

              return (
                <Accordion.Item key={dosenId} value={dosenId.toString()}>
                  <Accordion.Control>
                    <Group justify="space-between" pr="md">
                      <Group gap="sm">
                        <Stack gap={0}>
                          <Text size="xs" c="dimmed" fw={700}>
                            {label}
                          </Text>
                          <Text fw={600}>{group.dosen.user.nama}</Text>
                        </Stack>
                      </Group>
                      <Group gap="xl">
                        <Stack gap={0} align="flex-end">
                          <Text size="xs" c="dimmed">
                            Nilai Rata-rata
                          </Text>
                          <Text fw={700} c="indigo">
                            {Number(group.totalNilai || 0).toFixed(2)}
                          </Text>
                        </Stack>
                        {group.isFinal ? (
                          <Badge color="green" variant="light">
                            FINAL
                          </Badge>
                        ) : (
                          <Badge color="gray" variant="light">
                            DRAF
                          </Badge>
                        )}
                      </Group>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Box px="md" pb="md">
                      {group.scores.length > 0 ? (
                        <Table variant="unstyled" verticalSpacing="xs">
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th
                                style={{ fontSize: "10px", color: "gray" }}
                              >
                                KOMPONEN
                              </Table.Th>
                              <Table.Th
                                style={{ fontSize: "10px", color: "gray" }}
                                w={60}
                              >
                                BOBOT
                              </Table.Th>
                              <Table.Th
                                style={{ fontSize: "10px", color: "gray" }}
                                w={60}
                              >
                                NILAI
                              </Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {group.scores.map(
                              (sc: ScoreDetail, idx: number) => {
                                const bRaw =
                                  sc.komponenPenilaian.bobotKomponenPerans?.find(
                                    (b: { peran: string; bobot: number }) =>
                                      b.peran === penguji?.peran,
                                  )?.bobot || 0;
                                return (
                                  <Table.Tr
                                    key={idx}
                                    style={{
                                      borderBottom:
                                        "1px solid var(--mantine-color-gray-1)",
                                    }}
                                  >
                                    <Table.Td>
                                      <Text size="xs">
                                        {sc.komponenPenilaian.kriteria}
                                      </Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="xs" c="dimmed">
                                        {bRaw}%
                                      </Text>
                                    </Table.Td>
                                    <Table.Td>
                                      {isKetua && !isFinalized ? (
                                        <NumberInput
                                          size="xs"
                                          w={70}
                                          min={0}
                                          max={100}
                                          value={Number(sc.nilai)}
                                          onChange={(val) =>
                                            handleGlobalScoreUpdate(
                                              sc.dosenId,
                                              sc.komponenPenilaianId,
                                              Number(val),
                                            )
                                          }
                                        />
                                      ) : (
                                        <Text size="xs" fw={700}>
                                          {Number(sc.nilai)}
                                        </Text>
                                      )}
                                    </Table.Td>
                                  </Table.Tr>
                                );
                              },
                            )}
                          </Table.Tbody>
                        </Table>
                      ) : (
                        <Text
                          size="xs"
                          c="dimmed"
                          fs="italic"
                          ta="center"
                          py="md"
                        >
                          Belum ada nilai yang diinputkan oleh penguji ini.
                        </Text>
                      )}
                    </Box>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>

          {/* Finalize Button for Chairperson */}
          {isKetua && !isFinalized && (
            <Paper withBorder p="xl" radius="md" bg="indigo.6" mt="lg">
              <Group justify="space-between">
                <Stack gap={0}>
                  <Title order={3} c="white">
                    Finalisasi Hasil Ujian
                  </Title>
                  <Text c="white" opacity={0.8} size="sm">
                    Pastikan seluruh penguji telah memberikan nilai final
                    sebelum menutup sesi penilaian ini.
                  </Text>
                </Stack>
                <Button
                  size="lg"
                  color="white"
                  variant="white"
                  style={{ color: "var(--mantine-color-indigo-7)" }}
                  loading={isFinalizing}
                  onClick={handleFinalize}
                  leftSection={<IconLock size={20} />}
                >
                  Finalisasi Sekarang
                </Button>
              </Group>
            </Paper>
          )}
        </Stack>
      )}
    </Stack>
  );
}
