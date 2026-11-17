/* Uporedni horoskop – tumačenja ključnih parova. k = konjunkcija, h = skladni (trigon, sekstil), c = izazovni (kvadrat, opozicija) */
window.NK_SYN = {
 'Sun-Moon': {
  k: 'Sunce jedne osobe na Mesecu druge je jedan od najlepših znakova povezanosti. Jedno daje svetlost i pravac, drugo toplinu i razumevanje, pa se često osećate kao da se znate oduvek.',
  h: 'Sunce i Mesec se skladno dodiruju: ono što jedno od vas želi, drugo prirodno podržava. Ovo je odličan temelj za svakodnevni život, prijateljstvo i dug, miran odnos.',
  c: 'Sunce i Mesec stoje u napetom uglu: ponekad jedno želi akciju, a drugo mir i sigurnost. Upravo tu učite jedno od drugog – kada razgovarate o potrebama, ova razlika postaje lepa ravnoteža.'
 },
 'Venus-Mars': {
  k: 'Venera i Mars u konjunkciji donose snažnu, prirodnu privlačnost i hemiju koja se oseća. Romantika i strast ovde idu ruku pod ruku.',
  h: 'Venera i Mars se skladno dopunjuju: nežnost i inicijativa lepo se slažu, pa je privlačnost prijatna, opuštena i dugotrajna.',
  c: 'Venera i Mars u izazovnom aspektu stvaraju varnice – privlačnost je jaka, a ponekad i nestrpljiva. Ova energija drži odnos živim, pogotovo kada je usmerite na zajedničke strasti, a ne na nadmetanje.'
 },
 'Moon-Moon': {
  k: 'Vaši Meseci su zajedno, pa slično osećate i reagujete. Lako vam je da stvorite zajednički dom i atmosferu u kojoj se oboje osećate sigurno.',
  h: 'Meseci u skladnom aspektu donose emotivno razumevanje bez mnogo reči. Dobro se osećate u istom prostoru, a i loše dane lakše prebrodite zajedno.',
  c: 'Meseci u napetom uglu znače da vam trebaju različite stvari da biste se smirili. To nije prepreka, već poziv da naučite „jezik“ osećanja one druge osobe – i tada se razlike lepo dopunjuju.'
 },
 'Sun-Sun': {
  k: 'Vaša Sunca su zajedno: imate sličnu suštinu, ciljeve i način na koji sijate. Lako se prepoznajete, samo pazite da ostavite prostora i jedno drugom za scenu.',
  h: 'Sunca u skladnom aspektu daju prirodnu podršku i sličan životni ritam. Volite iste stvari na različite načine, pa se lepo dopunjujete i inspirišete.',
  c: 'Sunca u izazovnom aspektu znače dva različita pogleda na svet. To ume da bude izazov, ali i velika prednost: zajedno vidite celu sliku i podstičete jedno drugo da rastete.'
 },
 'Venus-Venus': {
  k: 'Vaše Venere su zajedno, pa imate sličan ukus, isti način da pokažete ljubav i uživate u istim stvarima. Zajednički izlasci i lepi trenuci vam idu sami od sebe.',
  h: 'Venere u skladnom aspektu donose nežnost i lako slaganje oko onoga što je lepo i prijatno. Znate kako da obradujete jedno drugo.',
  c: 'Venere u napetom uglu znače da ljubav pokazujete na različite načine. Kada naučite šta ona druga osoba doživljava kao pažnju, razlika postaje bogatstvo.'
 },
 'Mars-Mars': {
  k: 'Vaši Marsevi su zajedno: imate sličnu energiju i tempo. Kada idete ka istom cilju, nezaustavljivi ste – samo pazite da vam se volje ne sudare.',
  h: 'Marsevi u skladnom aspektu znače da lako radite zajedno i da se vaše energije podržavaju. Zajednički projekti, sport i avanture vam odlično leže.',
  c: 'Marsevi u izazovnom aspektu donose dosta energije i povremene rasprave. Kada tu snagu usmerite na zajednički cilj, postajete odličan tim.'
 },
 ASC: {
  k: function (pl, who) { return pl + ' osobe ' + who + ' leži na podznaku one druge, pa je prvi utisak bio snažan i poseban. Ta osoba vas doslovno „vidi“ i pokreće.'; },
  h: function (pl, who) { return pl + ' osobe ' + who + ' skladno dodiruje podznak one druge: prirodno se podržavate i lepo izgledate zajedno, i u društvu i u svakodnevici.'; },
  c: function (pl, who) { return pl + ' osobe ' + who + ' stoji u napetom uglu prema podznaku one druge: ova veza vas budi i izaziva da pokažete nove strane sebe.'; }
 },
 elements: {
  same: 'isti element – lako razumevanje, sličan tempo',
  comp: 'elementi koji se dopunjuju – podrška i inspiracija',
  diff: 'različiti elementi – učite jedno od drugog'
 },
 scoreLabels: [
  [80, 'Zvezde su vam baš naklonjene ✦'], [65, 'Lepo slaganje i dosta lakoće'], [50, 'Dobra osnova, uz malo truda'],
  [35, 'Izazovno, ali poučno i živo'], [0, 'Velike razlike – mnogo prostora za rast']
 ]
};
