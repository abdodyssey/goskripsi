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
  const isRanpelEligible = ranpelList.length > 0;
  const isEligible = isIpkEligible && isSemesterEligible && isRanpelEligible;
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
    if (lowerName.includes("ktm")) matchingDoc = myDocs.find((d) => d.jenis === "KTM");
    else if (lowerName.includes("transkrip")) matchingDoc = myDocs.find((d) => d.jenis === "TRANSKRIP_NILAI");
    else if (lowerName.includes("bta")) matchingDoc = myDocs.find((d) => d.jenis === "SERTIFIKAT_BTA");
    else if (lowerName.includes("kkn")) matchingDoc = myDocs.find((d) => d.jenis === "SERTIFIKAT_KKN");
    else if (lowerName.includes("toefl")) matchingDoc = myDocs.find((d) => d.jenis === "SERTIFIKAT_TOEFL");

    return (
      <Paper
        key={syarat.id}
        withBorder
        radius="md"
        p="sm"
        bg={hasFile ? (isDark ? "teal.9" : "teal.0") : (isDark ? "dark.7" : "white")}
        style={{
          borderColor: hasFile 
            ? "var(--mantine-color-teal-3)" 
            : isWajib && !hasFile 
              ? "var(--mantine-color-red-2)" 
              : undefined,
          transition: "all 0.2s ease"
        }}
      >
        <Stack gap={8}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" align="flex-start" wrap="nowrap">
               <ThemeIcon 
                  variant={hasFile ? "filled" : "light"} 
                  color={hasFile ? "teal" : isWajib ? "red" : "gray"} 
                  size={24} 
                  radius="md"
               >
                 {hasFile ? <IconCheck size={14} stroke={3} /> : <IconFile size={14} />}
               </ThemeIcon>
               
               <div>
                  <Group gap={6} mb={2}>
                    <Text size="sm" fw={600} c={isDark ? "gray.3" : "gray.8"}>
                      {syarat.namaSyarat}
                    </Text>
                    {isWajib && <Badge size="xs" variant="light" color="red" radius="sm">Wajib</Badge>}
                  </Group>
                  <Text size="10px" c="dimmed">Format yang diterima: PDF</Text>
               </div>
            </Group>

            {matchingDoc && !hasFile && (
              <Button
                size="compact-xs"
                variant="light"
                color="indigo"
                radius="md"
                leftSection={<IconUserCircle size={12} />}
                onClick={() => handleUseExistingDoc(String(syarat.id), matchingDoc!.fileUrl, syarat.namaSyarat)}
              >
                Gunakan dari Profil
              </Button>
            )}
          </Group>

          <FileInput
            size="sm"
            variant="filled"
            placeholder={hasFile ? "Ganti berkas..." : "Klik untuk pilih berkas PDF"}
            value={syaratFiles[syarat.id] || null}
            onChange={(file) => handleFileChange(String(syarat.id), file)}
            clearable
            accept=".pdf"
            styles={{
              input: {
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                fontSize: "12px",
                border: "1px dashed var(--mantine-color-gray-3)"
              }
            }}
          />
        </Stack>
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
          {/* Unified Profile & Readiness Section */}
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="md">
               <Group gap={12}>
                  <ThemeIcon variant="light" size={40} radius="md" color="indigo">
                    <IconUserCircle size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="md">Verifikasi Data Mahasiswa</Text>
                    <Text size="xs" c="dimmed">Pastikan data akademik Anda sudah benar</Text>
                  </div>
               </Group>
               <Button
                component={Link}
                href="/dashboard/profile"
                variant="light"
                size="xs"
                radius="md"
                rightSection={<IconExternalLink size={12} />}
              >
                Edit Profil
              </Button>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Stack gap={10}>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                    <Group gap="xl">
                      <div>
                        <Text size="10px" c="dimmed" fw={700} tt="uppercase">Nama Lengkap</Text>
                        <Text size="sm" fw={600}>{userData?.nama}</Text>
                      </div>
                      <div>
                        <Text size="10px" c="dimmed" fw={700} tt="uppercase">NIM</Text>
                        <Text size="sm" fw={600}>{userData?.nim}</Text>
                      </div>
                    </Group>
                    <Divider variant="dashed" my={10} />
                    <div>
                      <Text size="10px" c="dimmed" fw={700} tt="uppercase">Program Studi</Text>
                      <Text size="sm" fw={600}>{userData?.prodi?.nama_prodi || "-"}</Text>
                    </div>
                  </div>

                  <Paper withBorder p="sm" radius="md" bg="indigo.0" style={{ borderStyle: 'dashed' }}>
                     <Text size="10px" c="indigo" fw={800} tt="uppercase" mb={4}>Rancangan Penelitian (Ranpel) Aktif</Text>
                     <Text size="sm" fw={600} className="line-clamp-2">
                        {ranpelList.find((r) => r.value === form.values.ranpel_id)?.label || "-"}
                     </Text>
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                 <Stack gap={8} h="100%" justify="center" className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                   <Text size="xs" fw={700} c="blue.8">Cek Kelayakan Pendaftaran:</Text>
                   
                   <Group justify="space-between">
                     <Text size="xs">IPK (Min 2.00)</Text>
                     <Badge color={isIpkEligible ? "teal" : "red"} variant="light">{ipkValue.toFixed(2)}</Badge>
                   </Group>

                   <Group justify="space-between">
                     <Text size="xs">Semester (Min 6)</Text>
                     <Badge color={isSemesterEligible ? "teal" : "red"} variant="light">Smstr {semesterValue}</Badge>
                   </Group>

                   <Group justify="space-between">
                     <Text size="xs">Status Ranpel</Text>
                     <Badge color={isRanpelEligible ? "teal" : "red"} variant="light">{isRanpelEligible ? "ACC" : "NONE"}</Badge>
                   </Group>
                 </Stack>
              </Grid.Col>
            </Grid>

            {!isEligible && (
              <Alert color="red" icon={<IconAlertCircle size={16} />} p="sm" mt="md" radius="md">
                <Text size="xs" fw={500}>
                  {!isRanpelEligible
                    ? "Rancangan Penelitian (Ranpel) Anda belum disetujui oleh Kaprodi atau Anda belum mengajukan Ranpel."
                    : "Anda belum memenuhi syarat akademik (IPK/Semester) untuk mendaftar ujian."}
                </Text>
              </Alert>
            )}
          </Paper>


          <Paper withBorder p="lg" radius="md">
            <Text fw={700} size="sm" mb="lg">Alur Ujian Skripsi</Text>
            <Timeline
              bulletSize={36}
              lineWidth={2}
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
                  const current = activePendaftaran.find((p) => p.jenis_id === id);
                  const isRegistered = current && ["menunggu", "revisi", "diterima"].includes(current.status);

                  let bulletColor = "gray";
                  let bulletIcon = <IconLock size={18} />;
                  let isSelectable = false;
                  let statusText = "Terkunci";
                  let statusColor = "gray";

                  if (id === 1) {
                    if (isPassed) {
                      bulletColor = "teal";
                      bulletIcon = <IconCheck size={18} />;
                      statusText = "Lulus";
                      statusColor = "teal";
                    } else if (isRegistered) {
                      bulletColor = "blue";
                      bulletIcon = <IconPlayerPlay size={18} />;
                      statusText = `Proses`;
                      statusColor = "blue";
                    } else {
                      bulletColor = "indigo";
                      bulletIcon = <IconSchool size={18} />;
                      isSelectable = true;
                      statusText = "Tersedia";
                      statusColor = "indigo";
                    }
                  } else if (id === 2) {
                    if (isPassed) {
                      bulletColor = "teal";
                      bulletIcon = <IconCheck size={18} />;
                      statusText = "Lulus";
                      statusColor = "teal";
                    } else if (isRegistered) {
                      bulletColor = "blue";
                      bulletIcon = <IconPlayerPlay size={18} />;
                      statusText = `Proses`;
                      statusColor = "blue";
                    } else if (passedExams.includes(1)) {
                      bulletColor = "indigo";
                      bulletIcon = <IconFlask size={18} />;
                      isSelectable = true;
                      statusText = "Tersedia";
                      statusColor = "indigo";
                    } else { statusText = "Terkunci"; }
                  } else if (id === 3) {
                    if (isPassed) {
                      bulletColor = "teal";
                      bulletIcon = <IconCheck size={18} />;
                      statusText = "Lulus";
                      statusColor = "teal";
                    } else if (isRegistered) {
                      bulletColor = "blue";
                      bulletIcon = <IconPlayerPlay size={18} />;
                      statusText = `Proses`;
                      statusColor = "blue";
                    } else if (passedExams.includes(2)) {
                      bulletColor = "indigo";
                      bulletIcon = <IconCertificate size={18} />;
                      isSelectable = true;
                      statusText = "Tersedia";
                      statusColor = "indigo";
                    } else { statusText = "Terkunci"; }
                  }

                  const isSelected = form.values.jenis_ujian_id === String(id);

                  return (
                    <Timeline.Item
                      key={id}
                      bullet={bulletIcon}
                      color={bulletColor}
                      title={
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={isSelected ? 800 : 700} size="sm" c={isPassed ? "teal" : isRegistered ? "blue" : isSelectable ? "gray.8" : "gray.4"}>
                            {j.namaJenis}
                          </Text>
                          <Badge color={statusColor} size="xs" variant="light" radius="sm">
                            {statusText}
                          </Badge>
                        </Group>
                      }
                    >
                      <Paper
                        withBorder
                        p="sm"
                        mt={8}
                        radius="md"
                        style={{
                          cursor: isSelectable ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          borderColor: isSelected ? "var(--mantine-color-indigo-4)" : "var(--mantine-color-gray-1)",
                          backgroundColor: isSelected ? "var(--mantine-color-indigo-0)" : (isDark ? "transparent" : "var(--mantine-color-gray-0)"),
                          boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                        }}
                        onClick={() => { if (isSelectable) form.setFieldValue("jenis_ujian_id", String(id)); }}
                      >
                        <Text size="xs" fw={500} c={isSelectable ? "indigo.7" : "dimmed"}>
                          {isPassed ? "Tahap ini telah diselesaikan." : isRegistered ? "Pendaftaran sedang diproses." : isSelectable ? (isSelected ? "➔ Tahap Terpilih" : "Klik untuk pilih tahap ini") : "Prasyarat tahap sebelumnya belum terpenuhi."}
                        </Text>
                      </Paper>
                    </Timeline.Item>
                  );
                })}
            </Timeline>
          </Paper>

          {/* Syarat Section with per-item file uploads */}
          {selectedJenisUjianId && (
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
              <Group justify="space-between" mb="lg">
                <Group gap="sm">
                  <ThemeIcon variant="filled" color="indigo" radius="md">
                    <IconFile size={16} />
                  </ThemeIcon>
                  <Text size="md" fw={700}>Kelengkapan Berkas</Text>
                </Group>
                {syaratList.length > 0 && (
                  <Badge
                    variant="dot"
                    size="md"
                    color={wajibUploadedCount === wajibSyarat.length ? "teal" : "orange"}
                  >
                    {uploadedCount} dari {syaratList.length} Berkas
                  </Badge>
                )}
              </Group>

              {isLoadingSyarat ? (
                <Center py="xl"><Loader size="sm" color="indigo" /></Center>
              ) : syaratList.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">Tidak ada syarat khusus untuk jenis ujian ini.</Text>
              ) : (
                <Stack gap="md">
                  {wajibSyarat.length > 0 && (
                    <>
                      <Group gap={6} px={4}>
                        <Text size="xs" fw={700} tt="uppercase" c="red.6" className="tracking-wider">Berkas Wajib</Text>
                        <Divider style={{ flex: 1 }} opacity={0.4} />
                      </Group>
                      {wajibSyarat.map((syarat, idx) => renderSyaratItem(syarat, idx, true))}
                    </>
                  )}

                  {opsionalSyarat.length > 0 && (
                    <>
                      <Group gap={6} px={4} mt="md">
                        <Text size="xs" fw={700} tt="uppercase" c="gray.5" className="tracking-wider">Berkas Opsional</Text>
                        <Divider style={{ flex: 1 }} opacity={0.4} />
                      </Group>
                      {opsionalSyarat.map((syarat, idx) => renderSyaratItem(syarat, idx, false))}
                    </>
                  )}
                </Stack>
              )}
            </div>
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
