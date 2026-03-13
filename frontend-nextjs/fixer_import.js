const fs = require("fs");
function revert(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    /hooks\/use-rancanganPenelitian/g,
    "hooks/use-ranpel",
  );
  content = content.replace(
    /types\/rancanganPenelitian\.type/g,
    "types/ranpel.type",
  );
  content = content.replace(
    /schemas\/rancanganPenelitian\.schema/g,
    "schemas/ranpel.schema",
  );
  content = content.replace(
    /\.\/rancanganPenelitian-preview-modal/g,
    "./ranpel-preview-modal",
  );
  content = content.replace(
    /\.\/rancanganPenelitian-form-modal/g,
    "./ranpel-form-modal",
  );
  content = content.replace(
    /\.\/rancanganPenelitian\/components\/rancanganPenelitian/g,
    "./ranpel/components/ranpel",
  );
  fs.writeFileSync(file, content);
}
revert("src/features/ranpel/components/manajemen-ranpel-list.tsx");
revert("src/features/ranpel/components/pengajuan-ranpel-list.tsx");
revert("src/features/ranpel/components/ranpel-form-modal.tsx");
revert("src/features/ranpel/components/ranpel-preview-modal.tsx");
revert("src/features/ranpel/components/verifikasi-ranpel-list.tsx");
