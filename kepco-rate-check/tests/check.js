// 요금 산식 검증: index.html에 내장된 요금표와 동일 산식으로 수기 계산값과 대조합니다.
// 실행: node tests/check.js
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const T = JSON.parse(html.match(/<script id="tariff-embedded"[^>]*>([\s\S]*?)<\/script>/)[1]);
const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'tariff.json'), 'utf8'));
if (JSON.stringify(T) !== JSON.stringify(json)) { console.error('FAIL: index.html 내장 요금표와 data/tariff.json이 다릅니다. README의 동기화 명령을 실행하세요.'); process.exit(1); }

const floor = Math.floor, floor10 = x => Math.floor(x / 10) * 10, round = Math.round;
function seasonOf(m){ const s=T.common.seasons; if(s.summer.includes(m)) return 'summer'; if(s.winter.includes(m)) return 'winter'; return 'spring_fall'; }
function resBaseEnergy(r,m,kwh){ const isSummer=r.summer.months.includes(m); const blk=isSummer?r.summer:r.other; let prev=0,energy=0,tierIdx=0;
  for(let i=0;i<blk.tiers.length;i++){ const t=blk.tiers[i]; const cap=t.upto==null?Infinity:t.upto; const span=Math.max(0,Math.min(kwh,cap)-prev); if(kwh>prev) tierIdx=i; energy+=span*t.energy; prev=cap; if(kwh<=cap) break; }
  const su=isSummer?r.summer.months:(r.other.super_user_months||[]); if(su.includes(m)&&kwh>blk.super_user_over){ const top=blk.tiers[blk.tiers.length-1].energy; energy+=(kwh-blk.super_user_over)*(blk.super_user_rate-top); }
  return {base:blk.tiers[tierIdx].base, energy}; }
function calcMonth(key,m,kwh,kw,welfare){ const r=T.rates[key], c=T.common; let base=0,energy=0;
  if(r.type==='residential'){ const be=resBaseEnergy(r,m,kwh); base=be.base; energy=be.energy; } else { base=r.base_per_kw*kw; energy=r.energy[seasonOf(m)]*kwh; }
  base=floor(base); energy=floor(energy); const climate=floor(kwh*c.climate_won_per_kwh), fuel=floor(kwh*c.fuel_adj_won_per_kwh);
  let sub=base+energy+climate+fuel; if(r.type==='residential'&&r.min_charge&&sub<r.min_charge) sub=r.min_charge;
  const d=(key==='res_low'||key.startsWith('gen_')); const discount=(welfare&&d)?floor(sub*c.welfare_facility_discount):0; const bill=sub-discount;
  const vat=round(bill*c.vat_rate), fund=floor10(bill*c.fund_rate); return {base,energy,climate,fuel,sub,discount,bill,vat,fund,total:floor10(bill+vat+fund)}; }

const cases = [
  // 주택용 저압 350kWh, 기타계절: 200×120 + 150×214.6 = 56,190 / 기본 1,600 / 기후 3,150 / 연료 1,750 → 62,690 → VAT 6,269, 기금 1,690 → 70,640
  { key:'res_low', m:4, kwh:350, kw:3, w:false, expect:{energy:56190, base:1600, total:70640} },
  // 주택용 하계 350kWh: 300×120 + 50×214.6 = 46,730
  { key:'res_low', m:7, kwh:350, kw:3, w:false, expect:{energy:46730, base:1600} },
  // 주택용 동계 1,200kWh 슈퍼유저: 24,000+42,920+800×307.3=312,760 + 200×(736.2−307.3)=85,780 → 398,540
  { key:'res_low', m:1, kwh:1200, kw:3, w:false, expect:{energy:398540, base:7300} },
  // 주택용 0kWh 최저요금 1,000원
  { key:'res_low', m:4, kwh:0, kw:3, w:false, expect:{sub:1000} },
  // 일반용(갑)Ⅰ 저압 5kW 300kWh 4월: 기본 30,800 / 전력량 300×91.9=27,570
  { key:'gen_a1_low', m:4, kwh:300, kw:5, w:false, expect:{base:30800, energy:27570} },
  // 같은 조건 + 사회복지시설 30%: 62,570×0.3=18,771
  { key:'gen_a1_low', m:4, kwh:300, kw:5, w:true, expect:{discount:18771} },
  // 농사용(을) 저압 10kW 1,000kWh: 기본 11,500 / 전력량 65,900 / 감액은 적용 안 됨
  { key:'agr_b_low', m:7, kwh:1000, kw:10, w:true, expect:{base:11500, energy:65900, discount:0} },
  // 농사용(갑) 20kW 500kWh: 기본 7,200 / 전력량 24,150
  { key:'agr_a', m:5, kwh:500, kw:20, w:false, expect:{base:7200, energy:24150} },
];
let fail=0;
for(const c of cases){ const r=calcMonth(c.key,c.m,c.kwh,c.kw,c.w);
  for(const [k,v] of Object.entries(c.expect)){ if(r[k]!==v){ fail++; console.error(`FAIL ${c.key} ${c.m}월 ${c.kwh}kWh ${k}: got ${r[k]}, expect ${v}`); } } }
console.log(fail? `${fail}건 실패` : `${cases.length}건 모두 통과`); process.exit(fail?1:0);
