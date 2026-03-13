"use client";

import {
  Modal,
  Button,
  FileInput,
  Stack,
  Text,
  Badge,
  Group,
  Loader,
  Center,
  ThemeIcon,
  Divider,
  ScrollArea,
  useMantineColorScheme,
  Paper,
  Grid,
  Timeline,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconAlertCircle,
  IconFile,
  IconCheck,
  IconX,
  IconLock,
  IconPlayerPlay,
  IconSchool,
  IconFlask,
  IconCertificate,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Alert } from "@mantine/core";
import { JenisUjian, Syarat } from "../types/pendaftaran-ujian.type";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { pendaftaranUjianService } from "../api/pendaftaran-ujian.service";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { mahasiswaService } from "@/features/mahasiswa/api/mahasiswa.service";
import Link from "next/link";
import { IconExternalLink, IconUserCircle } from "@tabler/icons-react";

interface PendaftaranUjianFormModalProps {
  opened: boolean;
  onClose: () => void;
  mahasiswaId: string;
  jenisUjianList: JenisUjian[];
  ranpelList: { value: string; label: string }[];
  createPendaftaran: (formData: FormData) => Promise<unknown>;
  isCreating: boolean;
}

export function PendaftaranUjianFormModal({
  opened,
  onClose,
  mahasiswaId,
  jenisUjianList,
  ranpelList,
  createPendaftaran,
  isCreating,
}: PendaftaranUjianFormModalProps) {
  const { userResponse } = useAuth();
  const userData = userResponse?.user;

  // Eligibility check
  const ipkValue = userData?.ipk ? parseFloat(userData.ipk.toString()) : 0;
  const semesterValue = userData?.semester
    ? parseInt(userData.semester.toString(), 10)
    : 0;

  const isIpkEligible = ipkValue >= 2;
  const isSemesterEligible = semesterValue >= 6;
  const isEligible = isIpkEligible && isSemesterEligible;
  // Map syarat_id -> File for per-syarat uploads
  const [syaratFiles, setSyaratFiles] = useState<Record<string, File | null>>(
    {},
  );

  // Fetch student's pre-uploaded documents
  const { data: myDocsData } = useQuery({
    queryKey: ["my-documents"],
    queryFn: () => mahasiswaService.getMyDocuments(),
    enabled: opened,
  });

  const myDocs = myDocsData?.data || [];

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const form = useForm({
    initialValues: {
      jenis_ujian_id: "",
      ranpel_id: "",
    },
    validate: {
      jenis_ujian_id: (val) => (!val ? "Jenis ujian wajib dipilih" : null),
      ranpel_id: (val) => (!val ? "Rancangan penelitian wajib dipilih" : null),
    },
  });

  // Auto-select Ranpel if there's only one option
  useEffect(() => {
    if (opened && ranpelList.length === 1 && !form.values.ranpel_id) {
      form.setFieldValue("ranpel_id", ranpelList[0].value);
    }
  }, [opened, ranpelList, form]);

  // Derive selected jenis ujian from form value
  const selectedJenisUjianId = form.values.jenis_ujian_id || null;

  // Fetch syarat when jenis ujian changes
  const { data: syaratData, isLoading: isLoadingSyarat } = useQuery({
    queryKey: ["syarat-jenis-ujian", selectedJenisUjianId],
    queryFn: () =>
      pendaftaranUjianService.getSyaratByJenisUjian(
        selectedJenisUjianId as string,
      ),
    enabled: !!selectedJenisUjianId,
  });

  const syaratList: Syarat[] = syaratData?.data || [];
  const wajibSyarat = syaratList.filter((s) => s.wajib);
  const opsionalSyarat = syaratList.filter((s) => !s.wajib);

  const handleFileChange = (syaratId: string, file: File | null) => {
    setSyaratFiles((prev) => ({ ...prev, [syaratId]: file }));
  };

  // Count uploaded files
  const uploadedCount = Object.values(syaratFiles).filter(Boolean).length;
  const wajibUploadedCount = wajibSyarat.filter(
    (s) => syaratFiles[s.id],
  ).length;

  const handleSubmit = async (values: typeof form.values) => {
    // Validate: all wajib syarat must have files
    const missingSyarat = wajibSyarat.filter((s) => !syaratFiles[s.id]);
    if (missingSyarat.length > 0) {
      notifications.show({
        title: "Berkas Belum Lengkap",
        message: `Masih ada ${missingSyarat.length} berkas wajib yang belum diunggah`,
        color: "orange",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("mahasiswa_id", mahasiswaId);
      formData.append("jenis_ujian_id", values.jenis_ujian_id);
      formData.append("ranpel_id", values.ranpel_id);

      // Append files with syarat name as the original filename
      syaratList.forEach((syarat) => {
        const file = syaratFiles[syarat.id];
        if (file) {
          // Get file extension
          const ext = file.name.split(".").pop() || "pdf";
          // Create a new file with syarat name as filename
          const renamedFile = new File([file], `${syarat.namaSyarat}.${ext}`, {
            type: file.type,
          });
          formData.append("berkas", renamedFile);
        }
      });

      await createPendaftaran(formData);
      notifications.show({
        title: "Berhasil",
        message: "Pendaftaran ujian berhasil diajukan.",
        color: "teal",
      });
      form.reset();
      setSyaratFiles({});
      onClose();
    } catch (err: unknown) {
      const error = err as Record<
        string,
        Record<string, Record<string, string>>
      >;
      notifications.show({
        title: "Gagal Mengajukan",
        message:
          error?.response?.data?.message ||
          (err as Error)?.message ||
          "Terjadi kesalahan",
        color: "red",
      });
    }
  };

  const handleUseExistingDoc = async (
    syaratId: string,
    url: string,
    name: string,
  ) => {
    try {
      // Ensure we use the public URL if it's a Supabase storage URL
      const targetUrl = url.replace(
        "/object/authenticated/",
        "/object/public/",
      );
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      handleFileChange(syaratId, file);
      notifications.show({
        title: "Dokumen Dipilih",
        message: "Menggunakan dokumen yang sudah ada di profil Anda",
        color: "blue",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error fetching existing document:", error);
      notifications.show({
        title: "Gagal Mengambil Dokumen",
        message: "Terjadi kesalahan saat mengambil dokumen Anda",
        color: "red",
      });
    }
  };

  const renderSyaratItem = (syarat: Syarat, idx: number, isWajib: boolean) => {
    const hasFile = !!syaratFiles[syarat.id];

    // Check if there's a matching document in "My Documents"
    const lowerName = syarat.namaSyarat.toLowerCase();
    let matchingDoc = null;
    if (lowerName.includes("ktm"))
      matchingDoc = myDocs.find((d) => d.jenis === "KTM");
    else if (lowerName.includes("transkrip"))
      matchingDoc = myDocs.find((d) => d.jenis === "TRANSKRIP_NILAI");
    else if (lowerName.includes("bta"))
      matchingDoc = myDocs.find((d) => d.jenis === "SERTIFIKAT_BTA");
    else if (lowerName.includes("kkn"))
      matchingDoc = myDocs.find((d) => d.jenis === "SERTIFIKAT_KKN");
    else if (lowerName.includes("toefl"))
      matchingDoc = myDocs.find((d) => d.jenis === "SERTIFIKAT_TOEFL");

    return (
      <Paper
        key={syarat.id}
        withBorder
        radius="sm"
        p="xs"
        bg={
          hasFile
            ? isDark
              ? "var(--mantine-color-teal-9)"
              : "var(--mantine-color-teal-0)"
            : isDark
              ? "var(--mantine-color-dark-7)"
              : "var(--mantine-color-white)"
        }
        style={{
          borderColor: hasFile
            ? isDark
              ? "var(--mantine-color-teal-8)"
              : "var(--mantine-color-teal-3)"
            : isWajib && !hasFile
              ? isDark
                ? "var(--mantine-color-red-8)"
                : "var(--mantine-color-red-3)"
              : "var(--mantine-color-default-border)",
        }}
      >
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <ThemeIcon
            variant="light"
            color={hasFile ? "teal" : isWajib ? "indigo" : "gray"}
            size="xs"
            radius="xl"
            mt={3}
          >
            {hasFile ? (
              <IconCircleCheck size={10} />
            ) : (
              <IconCircleDashed size={10} />
            )}
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Group justify="space-between" align="center" mb={4}>
              <Group gap={6}>
                <Text
                  size="xs"
                  fw={isWajib ? 500 : 400}
                  c={isWajib ? undefined : "dimmed"}
                >
                  {idx + 1}. {syarat.namaSyarat}
                </Text>

                {isWajib && (
                  <Badge size="xs" variant="filled" color="red">
                    Wajib
                  </Badge>
                )}
              </Group>

              {matchingDoc && !hasFile && (
                <Button
                  size="compact-xs"
                  variant="light"
                  color="indigo"
                  leftSection={<IconCheck size={10} />}
                  onClick={() =>
                    handleUseExistingDoc(
                      String(syarat.id),
                      matchingDoc!.fileUrl,
                      syarat.namaSyarat,
                    )
                  }
                >
                  Gunakan dari Profil
                </Button>
              )}
            </Group>
            <FileInput
              size="xs"
              placeholder="Klik untuk upload berkas"
              value={syaratFiles[syarat.id] || null}
              onChange={(file) => handleFileChange(String(syarat.id), file)}
              clearable
              leftSection={<IconFile size={16} />}
              accept=".pdf"
            />
          </div>
        </Group>
      </Paper>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Pendaftaran Ujian Baru"
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Profile Verification Section */}
          <Paper withBorder p="md" radius="md" bg="blue.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconUserCircle
                    size={20}
                    color="var(--mantine-color-blue-7)"
                  />
                  <Text fw={700} size="sm">
                    Konfirmasi Data Diri
                  </Text>
                </Group>
                <Button
                  component={Link}
                  href="/dashboard/profile"
                  variant="subtle"
                  size="compact-xs"
                  rightSection={<IconExternalLink size={12} />}
                >
                  Edit Profil
                </Button>
              </Group>

              <Divider variant="dashed" />

              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Nama Lengkap
                  </Text>
                  <Text size="sm" fw={600}>
                    {userData?.nama}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    NIM
                  </Text>
                  <Text size="sm" fw={600}>
                    {userData?.nim}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="xs" c="dimmed">
                    Program Studi
                  </Text>
                  <Text size="sm" fw={600}>
                    {userData?.prodi?.nama_prodi || "-"}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Divider variant="dashed" my={4} />
                  <Text size="xs" c="dimmed">
                    Rancangan Penelitian (Ranpel)
                  </Text>
                  <Text size="sm" fw={700} c="indigo">
                    {ranpelList.find((r) => r.value === form.values.ranpel_id)
                      ?.label || "-"}
                  </Text>
                </Grid.Col>
              </Grid>

              <Text size="xs" c="red" fw={500} mt={4}>
                * Jika data di atas salah, silakan perbarui di menu Profil
                sebelum melanjutkan.
              </Text>
            </Stack>
          </Paper>

          {/* Eligibility Section */}
          <Paper
            withBorder
            p="md"
            radius="md"
            bg={isEligible ? "green.0" : "red.0"}
          >
            <Stack gap="xs">
              <Text fw={700} size="sm">
                Syarat Pendaftaran:
              </Text>
              <Group justify="space-between">
                <Group gap="xs">
                  {isIpkEligible ? (
                    <IconCheck size={16} color="var(--mantine-color-green-7)" />
                  ) : (
                    <IconX size={16} color="var(--mantine-color-red-7)" />
                  )}
                  <Text size="xs" fw={isIpkEligible ? 500 : 700}>
                    IPK Minimal 2.00
                  </Text>
                </Group>
                <Badge
                  color={isIpkEligible ? "green" : "red"}
                  size="xs"
                  variant="filled"
                >
                  {ipkValue.toFixed(2)}
                </Badge>
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  {isSemesterEligible ? (
                    <IconCheck size={16} color="var(--mantine-color-green-7)" />
                  ) : (
                    <IconX size={16} color="var(--mantine-color-red-7)" />
                  )}
                  <Text size="xs" fw={isSemesterEligible ? 500 : 700}>
                    Semester Minimal 6
                  </Text>
                </Group>
                <Badge
                  color={isSemesterEligible ? "green" : "red"}
                  size="xs"
                  variant="filled"
                >
                  Smstr {semesterValue}
                </Badge>
              </Group>

              {!isEligible && (
                <Alert
                  color="red"
                  icon={<IconAlertCircle size={16} />}
                  p="xs"
                  mt="xs"
                >
                  <Text size="xs">
                    Maaf, Anda belum memenuhi syarat untuk mendaftar ujian.
                    Pastikan IPK dan Semester Anda sudah sesuai.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={700} size="sm" mb="md">
              Alur Ujian Skripsi
            </Text>
            <Timeline
              bulletSize={32}
              lineWidth={3}
              active={(() => {
                const passedExams = userData?.passed_exams || [];
                if (passedExams.includes(3)) return 3;
                if (passedExams.includes(2)) return 2;
                if (passedExams.includes(1)) return 1;
                return -1;
              })()}
            >
              {jenisUjianList
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map((j) => {
                  const id = Number(j.id);
                  const passedExams = userData?.passed_exams || [];
                  const activePendaftaran = userData?.active_pendaftaran || [];

                  const isPassed = passedExams.includes(id);
                  const current = activePendaftaran.find(
                    (p) => p.jenis_id === id,
                  );
                  const isRegistered =
                    current &&
                    ["menunggu", "revisi", "diterima"].includes(current.status);

                  let bulletColor = "gray";
                  let bulletIcon = <IconLock size={16} />;
                  let isSelectable = false;
                  let statusText = "Terkunci";
                  let statusColor = "gray";

                  // Seminar Proposal Logic
                  if (id === 1) {
                    if (isPassed) {
                      bulletColor = "teal";
                      bulletIcon = <IconCheck size={16} />;
                      statusText = "Sudah Lulus";
                      statusColor = "teal";
                    } else if (isRegistered) {
                      bulletColor = "blue";
                      bulletIcon = <IconPlayerPlay size={16} />;
                      statusText = `Terdaftar (${current.status})`;
                      statusColor = "blue";
                    } else {
                      bulletColor = "indigo";
                      bulletIcon = <IconSchool size={16} />;
                      isSelectable = true;
                      statusText = "Tersedia";
                      statusColor = "indigo";
                    }
                  }
                  // Ujian Hasil Logic
                  else if (id === 2) {
                    if (isPassed) {
                      bulletColor = "teal";
                      bulletIcon = <IconCheck size={16} />;
                      statusText = "Sudah Lulus";
                      statusColor = "teal";
                    } else if (isRegistered) {
                      bulletColor = "blue";
                      bulletIcon = <IconPlayerPlay size={16} />;
                      statusText = `Terdaftar (${current.status})`;
                      statusColor = "blue";
                    } else if (passedExams.includes(1)) {
                      bulletColor = "indigo";
                      bulletIcon = <IconFlask size={16} />;
                      isSelectable = true;
                      statusText = "Tersedia";
                      statusColor = "indigo";
                    } else {
                      statusText = "Belum Lulus Sempro";
                    }
                  }
                  // Ujian Skripsi Logic
                  else if (id === 3) {
                    if (isPassed) {
                      bulletColor = "teal";
                      bulletIcon = <IconCheck size={16} />;
                      statusText = "Sudah Lulus";
                      statusColor = "teal";
                    } else if (isRegistered) {
                      bulletColor = "blue";
                      bulletIcon = <IconPlayerPlay size={16} />;
                      statusText = `Terdaftar (${current.status})`;
                      statusColor = "blue";
                    } else if (passedExams.includes(2)) {
                      bulletColor = "indigo";
                      bulletIcon = <IconCertificate size={16} />;
                      isSelectable = true;
                      statusText = "Tersedia";
                      statusColor = "indigo";
                    } else {
                      statusText = "Belum Lulus Ujian Hasil";
                    }
                  }

                  const isSelected = form.values.jenis_ujian_id === String(id);

                  return (
                    <Timeline.Item
                      key={id}
                      bullet={bulletIcon}
                      color={bulletColor}
                      title={
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={isSelected ? 800 : 600} size="sm">
                            {j.namaJenis}
                          </Text>
                          <Badge color={statusColor} size="xs" variant="light">
                            {statusText}
                          </Badge>
                        </Group>
                      }
                    >
                      <Paper
                        withBorder
                        p="xs"
                        mt={4}
                        radius="md"
                        style={{
                          cursor: isSelectable ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          borderWidth: isSelected ? "2px" : "1px",
                          borderColor: isSelected
                            ? "var(--mantine-color-indigo-filled)"
                            : undefined,
                          backgroundColor: isSelected
                            ? isDark
                              ? "var(--mantine-color-dark-5)"
                              : "var(--mantine-color-indigo-0)"
                            : undefined,
                        }}
                        onClick={() => {
                          if (isSelectable) {
                            form.setFieldValue("jenis_ujian_id", String(id));
                          }
                        }}
                      >
                        <Text size="xs" c={isSelectable ? "indigo" : "dimmed"}>
                          {isPassed
                            ? "Anda telah menyelesaikan tahap ini."
                            : isRegistered
                              ? `Pendaftaran Anda sedang dalam status: ${current.status}`
                              : isSelectable
                                ? isSelected
                                  ? "➔ Tahap Terpilih"
                                  : "Klik di sini untuk mendaftar tahap ini"
                                : "Selesaikan tahap sebelumnya untuk membuka pendaftaran ini."}
                        </Text>
                      </Paper>
                    </Timeline.Item>
                  );
                })}
            </Timeline>
          </Paper>

          {/* Syarat Section with per-item file uploads */}
          {selectedJenisUjianId && (
            <Paper
              withBorder
              radius="xl"
              p="xl"
              bg={
                isDark
                  ? "var(--mantine-color-dark-6)"
                  : "var(--mantine-color-gray-0)"
              }
            >
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={700}>
                  📋 Upload Berkas Persyaratan
                </Text>
                {syaratList.length > 0 && (
                  <Badge
                    variant="light"
                    color={
                      wajibUploadedCount === wajibSyarat.length
                        ? "teal"
                        : "orange"
                    }
                  >
                    {uploadedCount}/{syaratList.length} diunggah
                  </Badge>
                )}
              </Group>

              {isLoadingSyarat ? (
                <Center py="md">
                  <Loader size="sm" color="indigo" />
                </Center>
              ) : syaratList.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Tidak ada syarat khusus untuk jenis ujian ini.
                </Text>
              ) : (
                <Stack gap="xs">
                  {wajibSyarat.length > 0 && (
                    <>
                      <Group gap="xs" align="center">
                        <ThemeIcon
                          variant="light"
                          color="red"
                          size="sm"
                          radius="xl"
                        >
                          <IconAlertCircle size={12} />
                        </ThemeIcon>
                        <Text size="xs" fw={600} c={isDark ? "red.4" : "red.7"}>
                          WAJIB — {wajibUploadedCount}/{wajibSyarat.length}{" "}
                          terunggah
                        </Text>
                      </Group>
                      {wajibSyarat.map((syarat, idx) =>
                        renderSyaratItem(syarat, idx, true),
                      )}
                    </>
                  )}

                  {opsionalSyarat.length > 0 && (
                    <>
                      <Divider my="xs" />
                      <Group gap="xs" align="center">
                        <ThemeIcon
                          variant="light"
                          color="gray"
                          size="sm"
                          radius="xl"
                        >
                          <IconCircleCheck size={12} />
                        </ThemeIcon>
                        <Text size="xs" fw={600} c="dimmed">
                          OPSIONAL ({opsionalSyarat.length} syarat)
                        </Text>
                      </Group>
                      {opsionalSyarat.map((syarat, idx) =>
                        renderSyaratItem(syarat, idx, false),
                      )}
                    </>
                  )}
                </Stack>
              )}
            </Paper>
          )}

          <Button
            type="submit"
            color="indigo"
            fullWidth
            mt="sm"
            loading={isCreating}
            disabled={!isEligible}
          >
            Ajukan Pendaftaran
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
