import { readFileSync } from 'fs';

const PROMPT_P1_1 = `First time una pathadhu clg bus la dha.... Apo nee yaru, un name, ena department kuda theriyathu.. just bus la random ah yarachu papom la aprm avanga next pakave mudiyathu like that... After bridge course, regular class start Achu apo students ellarum split pani department la potanga... Apo dha una namba class la pathen. Enaku apdiye sudden shock. Ne epdi inga nu. Aprm un name therinjuchu. One day Unaku neyabakam iruka nu therla first apo tha unkita notes kettu pesunen. Patha nee english laye pesitu irundha... Nanum manage pani dha pesuna.. but at the end, nane unkita ketten tamil theriyatha.. tamil la pesu nu ketten. Adhuku ne strangers kita english la dha pesuva nu sonna.. but,one day na clg leave pottu jolly a irukiya nu ketten..adhuku ne tamil la reply pana first time.. enaku apdiye shock..aprm dha unkita ketten hey ne dha pesuriya ila vera yaravadha nu. Ne edhuku kekura nu keta. Adha ne already sonna la strangers kitta english la dha pesuven nu . Odane ne laughing emoji send panita 😂. I don't know whether you remember or not...i still remember it as one of my sweetest day of my first year.`;

const PROMPT_P1_2 = `Aprm second year apo apo unkita pesunen.. mrng ne Vera bus la varuva.. evng mattum dha en bus la varuva apo dha unkita pesuven.. ne front seat la irupa na last seat la irupen. Suma fun ah pesitu irupom.. adhuvum rainy days la neraya vatti pesirupom la... May be they were just normal moments for you, but for me, they became beautiful memories... I'll always carry in my heart.. aprm Pongal celebration apo.. ne black saree la vandha.. you look so pretty on that day... Na kuda chat la unaku compliment sonna neyabakam iruka.. avlo crowd la kuda ne mattum thaniya therinja....aprm lab spiral pottu unaku kuduka ketten adhu ne pay pani dha vangipen Ilana vanga matten nu evlo neram chat la argue paniye i still remember....One day mattum na marakave matten.. 25 September 2024 ... Apo dha ne aludha dha pathen... enaku romba kastama irundhuchu.. apo andha time ne evlo emotional ah irupa nu purinjidhu... Unkita vandhu pesanum, enachu kekanum nu nenchen.. but enala mudila.. because of my hesitation.. as a frnd or whatever.. na vandhu unkita keturukanum.. ipo varaikum na Adhuku regret pandren... Adhuku dha unaku romba memorable ah close to heart oru gift kuduthen..I hope you still have the gift.. apo una force Panni kuduthutten.. once again sorry`;

const PROMPT_P2_1 = `Third year la kjm misunderstanding la nadandhuchu... Oru sila vishayam la enaku therinjuchu..na adha pathila unkita edhuvum solala.. enaku romba hurt agiduchu adha ketu.... Aprm nane realize pana una force pani pesura mari irundhuchu... Sometimes ne reply ye pana matta..but whenever I talk to you, ne natural ah pesuva without any hesitation.. i genuinely liked that about you... Nane unkuda pesa kudathu..una disturb pana kudathu nu irupen.. but sometimes epdiyo therila epayachu Suma edhana random ah pesiduven.. unkuda pesunathula sorry sonadhu dha athigam`;

const PROMPT_P2_2 = `Now we are in last year...Unkuda chat la dha pesiruken.. but nerla 1 minutes kuda full ah pesunathu ila... Seri adha unkuda one last time ah pesalam nu kupten...adhuvum na bayandhuttu dha una kupta...first time na yaru kittayum ipdi ketadhum pesunathum illa..na clg la First pesuna girl ne mattum dha...na adha marakave matten...Ne dha busy vara mudiyathu nu sollita...enaku kjm kastama dha irundhuchu.. it's ok that's my luck.. i respected your situation or whatever...... ♡`;

console.log("=== CHECKING CONFIG FILE ===");
const configContent = readFileSync('./src/config/birthdayConfig.ts', 'utf-8');

function assertContains(source, target, label) {
  if (source.includes(target)) {
    console.log(`[PASS] ${label} found verbatim!`);
  } else {
    console.error(`[FAIL] ${label} NOT found in file!`);
    process.exit(1);
  }
}

assertContains(configContent, PROMPT_P1_1, 'Page 1 Paragraph 1 in birthdayConfig.ts');
assertContains(configContent, PROMPT_P1_2, 'Page 1 Paragraph 2 in birthdayConfig.ts');
assertContains(configContent, PROMPT_P2_1, 'Page 2 Paragraph 1 in birthdayConfig.ts');
assertContains(configContent, PROMPT_P2_2, 'Page 2 Paragraph 2 in birthdayConfig.ts');

console.log("\n=== CHECKING STAGEMESSAGE COMPONENT ===");
const stageContent = readFileSync('./src/components/StageMessage.tsx', 'utf-8');

assertContains(stageContent, PROMPT_P1_1, 'Page 1 Paragraph 1 in StageMessage.tsx');
assertContains(stageContent, PROMPT_P1_2, 'Page 1 Paragraph 2 in StageMessage.tsx');
assertContains(stageContent, PROMPT_P2_1, 'Page 2 Paragraph 1 in StageMessage.tsx');
assertContains(stageContent, PROMPT_P2_2, 'Page 2 Paragraph 2 in StageMessage.tsx');

// Check special elements
assertContains(stageContent, '25 September 2024', 'Date 25 September 2024');
assertContains(stageContent, '😂', 'Emoji 😂');
assertContains(stageContent, '♡', 'Symbol ♡');

console.log("\nALL VERBATIM PARAGRAPH CHECKS PASSED PERFECTLY!");
