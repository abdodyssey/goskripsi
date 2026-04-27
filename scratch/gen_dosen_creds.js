
const dosenData = [
  { nip: "19750801 200912 2 001", nama: "Gusmelia Testiana, M.Kom." },
  { nip: "19751122 200604 1 003", nama: "Ruliansyah, S.T., M.Kom." },
  { nip: "19671107 199803 2 001", nama: "Dr. Fenny Purwani, M.Kom.", overrideFirstname: "fenny" },
  { nip: "19791125 201403 2 002", nama: "RUSMALA SANTI, M.Kom." },
  { nip: "19860503 201903 1 009", nama: "Catur Eri Gunawan, S.T., M.Cs." },
  { nip: "19870108 202012 1 009", nama: "Irfan Dwi Jaya, M.Kom." },
  { nip: "19871114 202321 1 026", nama: "Fenando, M.Kom." },
  { nip: "203118601", nama: "Freddy Kurnia Wijaya, S.Kom., M.Eng." },
  { nip: "19851015 202521 2 005", nama: "Evi Fadilah, M.Kom." },
  { nip: "19841023 202321 1 016", nama: "Muhamad Kadafi, M.Kom.", overrideFirstname: "kadafi" },
  { nip: "19851229 202321 1 020", nama: "Muhamad Son Muarie, M.Kom.", overrideFirstname: "son" },
  { nip: "19821117 202321 2 021", nama: "Fathiyah Nopriani, S.T., M.Kom." },
  { nip: "19891221 202321 1 018", nama: "Imamulhakim Syahid Putra, M.Kom." },
  { nip: "19890910 202321 1 028", nama: "Aminullah Imal Alfresi, S.T., M.Kom." },
  { nip: "19910104 202321 2 041", nama: "Sri Rahayu, M.Kom." },
  { nip: "19931230 202321 1 017", nama: "M. Leandry Dalafranka, S.SI., M.Kom.", overrideFirstname: "leandry" },
  { nip: "198905232025212020", nama: "Indah Hidayanti, S.T., M.Kom." },
  { nip: "19880904 202521 2 002", nama: "Reni Septiyanti, S.SI., M.Kom." },
  { nip: "19940630 202521 2 009", nama: "Gina Agiyani, M.Kom." },
  { nip: "19790403 202321 1 007", nama: "M. Syendi Apriko, M.Kom.", overrideFirstname: "syendi" },
  { nip: "199003212024031001", nama: "Deni Fikari, S.Kom., M.Kom." },
  { nip: "197202012000031004", nama: "Dr. Muhammad Isnaini, M.Pd", overrideFirstname: "isnaini" },
  { nip: "198701022018011001", nama: "REZA ADE PUTRA, S.Pd, M.Cs" },
  { nip: "19881215 202321 1 005", nama: "DIAN HAFIDH ZULFIKAR, S.Kom., M.Cs." },
];

const specialPasswords = {
  kadafi19841023: "muhamad19841023",
  son19851229: "muhamad19851229",
  imamulhakim19891221: "imamulhakim19891222",
  aminullah19890910: "aminullah19890911",
  sri19910104: "sri19910105",
  leandry19931230: "m.19931231",
  reni19880904: "reni19880905",
  gina19940630: "gina19940631",
};

const generateNipNim = (nama, nip, overrideFirstname) => {
  const firstName = overrideFirstname || nama.split(/[,\s]/)[0].toLowerCase();
  const nipDigits = nip.replace(/\D/g, "").substring(0, 8);
  return (firstName + nipDigits).toLowerCase();
};

const list = dosenData.map(d => {
  const username = generateNipNim(d.nama, d.nip, d.overrideFirstname);
  const password = specialPasswords[username] || username;
  return `${d.nama.padEnd(40)} | ${username.padEnd(25)} | ${password}`;
});

console.log("Nama                                     | Username                  | Password");
console.log("-".repeat(95));
list.forEach(line => console.log(line));
