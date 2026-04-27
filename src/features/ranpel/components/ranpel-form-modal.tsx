"use client";

import {
  Modal,
  Button,
  Textarea,
  Group,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  createRanpelFormSchema,
  CreateRanpelFormValues,
} from "../schemas/ranpel.schema";
import { notifications } from "@mantine/notifications";
import { useRanpelByMahasiswa } from "../hooks/use-ranpel";
import { useEffect } from "react";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { CustomRichTextEditor } from "@/components/ui/rich-text-editor";

interface RanpelFormModalProps {
  opened: boolean;
  onClose: () => void;
  mahasiswaId: string;
  editData?: PengajuanRancanganPenelitian | null;
}

export function RanpelFormModal({
  opened,
  onClose,
  mahasiswaId,
  editData,
}: RanpelFormModalProps) {
  const { createPengajuan, isCreating, updateRanpel, isUpdating } =
    useRanpelByMahasiswa(mahasiswaId);

  const form = useForm<CreateRanpelFormValues>({
    initialValues: {
      judul_penelitian: "",
      masalah_dan_penyebab: "",
      alternatif_solusi: "",
      metode_penelitian: "",
      hasil_yang_diharapkan: "",
      kebutuhan_data: "",
      jurnal_referensi: "",
    },
    validate: (values) => {
      const result = createRanpelFormSchema.safeParse(values);
      if (result.success) return {};
      return result.error.issues.reduce(
        (acc: Record<string, string>, issue) => {
          acc[issue.path[0] as string] = issue.message;
          return acc;
        },
        {},
      );
    },
  });

  // Effect to pre-fill form when in edit mode
  useEffect(() => {
    if (opened) {
      if (editData && editData?.rancanganPenelitian) {
        form.setValues({
          judul_penelitian:
            editData?.rancanganPenelitian?.judulPenelitian || "",
          masalah_dan_penyebab:
            editData?.rancanganPenelitian?.masalahDanPenyebab || "",
          alternatif_solusi:
            editData?.rancanganPenelitian?.alternatifSolusi || "",
          metode_penelitian:
            editData?.rancanganPenelitian?.metodePenelitian || "",
          hasil_yang_diharapkan:
            editData?.rancanganPenelitian?.hasilYangDiharapkan || "",
          kebutuhan_data: editData?.rancanganPenelitian?.kebutuhanData || "",
          jurnal_referensi:
            editData?.rancanganPenelitian?.jurnalReferensi || "",
        });
      } else {
        form.reset();
      }
    }
  }, [editData, opened]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: CreateRanpelFormValues) => {
    try {
      if (editData && editData.rancanganPenelitianId) {
        await updateRanpel({
          ranpelId: editData.rancanganPenelitianId.toString(),
          data: values,
        });
        notifications.show({
          title: "Berhasil",
          message: "Data Ranpel berhasil diperbarui.",
          color: "teal",
        });
      } else {
        await createPengajuan(values);
        notifications.show({
          title: "Berhasil",
          message: "Pengajuan Ranpel berhasil dibuat.",
          color: "teal",
        });
      }
      form.reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      notifications.show({
        title: editData ? "Gagal Memperbarui" : "Gagal Mengajukan",
        message:
          error?.response?.data?.message ||
          (err as Error)?.message ||
          "Terjadi kesalahan",
        color: "red",
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={0}>
          <MantineText fw={700} fz="lg" className="dark:text-white">
            {editData ? "Edit Ranpel" : "Form Pengajuan Ranpel"}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {editData
              ? "Perbarui detail rancangan penelitian Anda"
              : "Lengkapi detail rancangan penelitian Anda"}
          </MantineText>
        </Stack>
      }
      size="xl"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 4,
      }}
      styles={{
        header: { padding: "24px 24px 16px" },
        body: { padding: "0 24px 24px" },
        close: { color: "var(--mantine-color-slate-4)" },
      }}
    >
      <form
        onSubmit={form.onSubmit((values: CreateRanpelFormValues) =>
          handleSubmit(values),
        )}
      >
        <Stack gap="lg">
          <Textarea
            withAsterisk
            label="Judul Penelitian"
            placeholder="Masukkan judul usulan penelitian"
            autosize
            minRows={2}
            radius="md"
            {...form.getInputProps("judul_penelitian")}
            styles={{
              label: {
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
              },
            }}
          />
          <CustomRichTextEditor
            label="Masalah dan Penyebab"
            placeholder="Deskripsi singkat masalah..."
            {...form.getInputProps("masalah_dan_penyebab")}
          />
          <CustomRichTextEditor
            label="Alternatif Solusi"
            placeholder="Ide solusi yang diajukan..."
            {...form.getInputProps("alternatif_solusi")}
          />
          <CustomRichTextEditor
            label="Metode Penelitian"
            placeholder="Metode penyelesaian..."
            {...form.getInputProps("metode_penelitian")}
          />
          <CustomRichTextEditor
            label="Hasil yang Diharapkan"
            placeholder="Target capai dari solusi..."
            {...form.getInputProps("hasil_yang_diharapkan")}
          />
          <Stack gap="md">
            <CustomRichTextEditor
              label="Kebutuhan Data"
              placeholder="Sebutkan data yang diperlukan dalam penelitian..."
              {...form.getInputProps("kebutuhan_data")}
            />
            <CustomRichTextEditor
              label="Jurnal Referensi"
              placeholder="Sebutkan jurnal atau referensi utama..."
              {...form.getInputProps("jurnal_referensi")}
            />
          </Stack>

          <Group justify="flex-end" mt="xl" gap="md">
            <Button
              variant="subtle"
              color="slate.4"
              onClick={onClose}
              disabled={isCreating || isUpdating}
              radius="md"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={isCreating || isUpdating}
              color="indigo.9"
              radius="md"
              px="xl"
              h={42}
            >
              {editData ? "Simpan Perubahan" : "Ajukan Ranpel"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
