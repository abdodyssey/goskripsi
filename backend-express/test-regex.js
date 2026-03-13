const l = `src/services/dosen.service.ts(48,24): error TS2551: Property 'noHp' does not exist on type '{ nama: string; }'. Did you mean 'no_hp'?`;
console.log(
  l.match(
    /(src\/[a-zA-Z0-9_/-]+?\.ts)\((\d+),(\d+)\): error TS(2551|2561|2552): .*?Did you mean(?: to write)? '(.*?)'\?/,
  ),
);
