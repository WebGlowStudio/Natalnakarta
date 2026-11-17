/* Gledanje u šolju – samo za zabavu */
window.NK_CUP = {
 symbols: [
  { id: 'ptica', name: 'Ptica', area: 'Put', d: '<path d="M-15 3 Q-7 -9 0 1 Q7 -9 15 3" fill="none" stroke-width="3.2" stroke-linecap="round"/>', text: 'Ptica nosi lepe vesti. Uskoro stiže poruka ili poziv koji će te obradovati, a možda i neko putovanje.' },
  { id: 'put', name: 'Put', area: 'Put', d: '<path d="M-16 14 Q-6 8 -3 0 T 6 -10 T 16 -15" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 3"/>', text: 'Otvoren put u šolji znači pokret i nove mogućnosti. Ono što si zamislila ili zamislio kreće sa mrtve tačke.' },
  { id: 'srce', name: 'Srce', area: 'Ljubav', d: '<path d="M0 12 C-17 0 -10 -15 0 -5 C10 -15 17 0 0 12Z"/>', text: 'Srce u šolji je znak tople ljubavi i bliskosti. Neko misli na tebe više nego što pokazuje.' },
  { id: 'riba', name: 'Riba', area: 'Posao i novac', d: '<path d="M-14 0 Q-2 -10 10 0 Q-2 10 -14 0Z M10 0 L17 -7 L17 7Z"/>', text: 'Riba je stari znak obilja. Stiže ti novac, dobra ponuda ili nagrada za trud koji već dugo ulažeš.' },
  { id: 'prsten', name: 'Prsten', area: 'Ljubav', d: '<circle cx="0" cy="3" r="9" fill="none" stroke-width="3.2"/><path d="M-4 -7 L0 -13 L4 -7Z"/>', text: 'Prsten govori o vezi, obećanju i lepom dogovoru – u ljubavi ili u saradnji koja traje.' },
  { id: 'drvo', name: 'Drvo', area: 'Zdravlje', d: '<rect x="-2" y="2" width="4" height="13"/><circle cx="0" cy="-4" r="10"/>', text: 'Drvo donosi snagu, zdravlje i stabilan rast. Tvoje korenje je jako, a period pred tobom je plodan.' },
  { id: 'zmija', name: 'Zmija', area: 'Zdravlje', d: '<path d="M-15 9 Q-8 -9 0 3 Q8 15 15 -5" fill="none" stroke-width="3.6" stroke-linecap="round"/><circle cx="15" cy="-6" r="2.6"/>', text: 'Zmija je ovde znak mudrosti i obnove. Ostavljaš staru „kožu“ i ulaziš u svežiji, lakši period.' },
  { id: 'kljuc', name: 'Ključ', area: 'Želja', d: '<circle cx="-9" cy="0" r="6" fill="none" stroke-width="3"/><path d="M-3 0 H15 M9 0 V6 M14 0 V5" fill="none" stroke-width="3" stroke-linecap="round"/>', text: 'Ključ otvara vrata. Rešenje koje tražiš je bliže nego što misliš, a jedna želja dobija zeleno svetlo.' },
  { id: 'mesec', name: 'Mesec', area: 'Ljubav', d: '<path d="M4 -13 A13 13 0 1 0 4 13 A10 10 0 1 1 4 -13Z"/>', text: 'Mesec donosi romantiku i jaku intuiciju. Veruj osećaju – on te sada dobro vodi.' },
  { id: 'zvezda', name: 'Zvezda', area: 'Želja', d: '<path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4Z"/>', text: 'Zvezda je najlepši znak u šolji: želja koju nosiš u srcu ima sve šanse da se ostvari.' },
  { id: 'kuca', name: 'Kuća', area: 'Posao i novac', d: '<path d="M-11 13 V-1 L0 -12 L11 -1 V13Z"/>', text: 'Kuća znači sigurnost i stabilnost – u domu, porodici ili poslu. Nešto se lepo slaže na svoje mesto.' },
  { id: 'sidro', name: 'Sidro', area: 'Posao i novac', d: '<path d="M0 -12 V12 M-8 -5 H8 M-12 4 Q-10 13 0 12 Q10 13 12 4" fill="none" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-13" r="3" fill="none" stroke-width="2.4"/>', text: 'Sidro je znak stabilnosti i uspeha koji traje. Ono što sada gradiš ima čvrste temelje.' },
  { id: 'planina', name: 'Planina', area: 'Posao i novac', d: '<path d="M-16 12 L-4 -10 L3 1 L8 -5 L17 12Z"/>', text: 'Planina pokazuje veliki cilj na vidiku. Uz malo strpljenja stižeš do vrha, a pogled odozgo će biti divan.' },
  { id: 'cvet', name: 'Cvet', area: 'Ljubav', d: '<circle cx="0" cy="-7" r="5"/><circle cx="7" cy="-1" r="5"/><circle cx="-7" cy="-1" r="5"/><circle cx="4" cy="7" r="5"/><circle cx="-4" cy="7" r="5"/>', text: 'Cvet najavljuje radost, kompliment i lepe trenutke. Nešto u tvom životu upravo procvetava.' }
 ],
 areas: {
  'Ljubav': ['U ljubavi te čeka toplina i jedan lep, iskren razgovor.', 'Srce ti je otvoreno, a to privlači prave ljude.', 'Neko ti uskoro pokazuje koliko mu značiš.'],
  'Posao i novac': ['Posao kreće nabolje, a trud se uskoro vraća.', 'Na vidiku je dobra ponuda ili neočekivan priliv novca.', 'Jedna ideja koju imaš vredi više nego što misliš.'],
  'Put': ['Šolja pokazuje pokret: kraći put ili nova vrata koja se otvaraju.', 'Stiže vest izdaleka koja te raduje.', 'Promena sredine doneće ti svežu energiju.'],
  'Zdravlje': ['Energija ti raste – samo slušaj telo i odmaraj kada treba.', 'Period je dobar za nove zdrave navike.', 'Mir i dobar san su tvoj najjači saveznik ovih dana.'],
  'Želja': ['Želja koju si zamislila ili zamislio ima zeleno svetlo.', 'Ono što želiš polako dolazi, samo ga pusti da stigne.', 'Mala želja se ostvaruje brže nego što očekuješ.']
 }
};
