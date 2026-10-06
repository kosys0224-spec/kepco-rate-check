# 전기요금 계약종별 진단 계산기 (KEPCO Rate Class Checker)

경로당·마을회관, 농가·축사, 소상공인 시설이 **지금 쓰는 전기요금 계약종별이 맞는지**, 다른 종별로 바꾸면 **1년에 얼마가 달라지는지**를 한국전력공사 공개 요금표로 계산하는 한 페이지짜리 웹 도구입니다.

서버가 없고 입력값은 브라우저 밖으로 나가지 않습니다. `index.html` 하나를 열면 바로 동작합니다.

**→ 사용해 보기: https://kosys0224-spec.github.io/kepco-rate-check/**

## 왜 만들었나

같은 전기를 써도 계약종별에 따라 요금이 다릅니다. 경로당이 일반용으로 계약돼 있으면서 사회복지시설 감액(30%)을 신청하지 않았거나, 농사용(을) 자격이 되는 저온창고가 일반용 요금을 내는 경우가 현장에 있습니다. 2026년 논산시는 경로당 1,100개소를 점검해 415개소의 개선 방안을 찾았고, 그중 193개소가 감액 미신청 상태였습니다.

이 문제는 2026년 이천시 상반기 정책제안 공모전(경로당·마을회관 전기요금 계약 적정성 진단)과 고흥군 아이디어 공모전(농업용 전기 계약종별 확인·전환 안내)에서 각각 장려상을 받은 제안의 소재입니다. 제안서로만 두지 않고, 담당 공무원이나 시설 관리자가 고지서 한 장만 들고 바로 확인할 수 있도록 도구로 만들었습니다.

## 누가 쓰나

| 사용자 | 쓰는 방법 |
|---|---|
| 지자체 노인복지·마을 담당 | 관내 경로당·마을회관 고지서를 넣어 감액 미신청·종별 부적정 시설을 걸러냄 |
| 경로당·마을회관 관리자 | 자기 시설 고지서로 바꿀 가치가 있는지 확인 후 한전 123 신청 |
| 농가·축산·양식 | 일반용으로 계약된 저온창고·축사가 농사용(을) 대상인지 금액으로 확인 |
| 전기공사업체·전기안전관리자 | 고객 시설 점검 시 요금 측면 안내 자료로 사용 |

## 기능

- 시설 유형 프리셋(경로당·마을회관 / 농가 / 양수펌프 / 소상공인 / 학교 / 직접 선택)
- 비교 종별: 주택용(저압), 일반용(갑)Ⅰ 저압, 교육용(갑) 저압, 산업용(갑)Ⅰ 저압, 농사용(갑), 농사용(을) 저압
- 월 평균 1개 또는 최근 12개월 월별 사용량 입력 (계절별 단가 반영)
- 사회복지시설 감액 30% 적용 / 현재 수령 여부 분리 입력
- 종별별 연간 요금, 현재 대비 차이, 적용 조건(약관 조문), 월별 내역표
- 요금표는 `data/tariff.json` 한 파일로 분리 — 요금 개정 시 이 파일만 고치면 됨

## 산식

```
월 요금 = 기본요금 + 전력량요금 + 기후환경요금(9원/kWh) + 연료비조정요금(+5원/kWh)
         [− 사회복지시설 감액 30%]
       → + 부가가치세 10% (원 미만 반올림)
       → + 전력산업기반기금 2.7% (10원 미만 절사)
       → 10원 미만 절사
```

- 주택용(저압): 누진 3단계, 하계(7~8월) 별도 구간, 1,000kWh 초과 슈퍼유저 단가(하계·동계), 최저요금 1,000원
- 그 밖의 종별: 기본요금 = 계약전력(kW) × 단가, 전력량요금 = 계절별 단가 × 사용량. 저압 요금적용전력은 계약전력으로 둡니다.
- 계절 구분: 여름 6~8월 / 봄·가을 3~5·9~10월 / 겨울 11~2월 (주택용은 7~8월만 하계)

다루지 않는 것: 고압, 시간대별 요금(갑Ⅱ·을), 선택요금 Ⅰ·Ⅱ·Ⅲ, 역률요금, TV수신료, 복지할인 한도형(장애인·기초수급 등), 1주택수가구, 아파트 단일·종합계약.

## 데이터 출처와 기준일

`data/tariff.json`에 모든 단가와 출처 URL, 시행일을 적어 두었습니다. 2026-10-06에 사이버한전에서 직접 확인한 값입니다.

| 항목 | 값 | 출처 |
|---|---|---|
| 주택용·일반용·교육용·산업용 단가 | 2023-11-09 시행분 | 사이버한전 전기요금표 |
| 농사용(갑)·(을) 단가 | 2025-04-01 시행분 (갑 48.3 / 을 저압 65.9원/kWh) | 사이버한전 전기요금표(농사용) |
| 기후환경요금 | 9.0원/kWh (2023.1~) | 사이버한전 기후환경요금 안내 |
| 연료비조정단가 | +5.0원/kWh (2026년 4분기까지 유지) | 한전 분기 공고, 뉴시스 2026-09-21 |
| 전력산업기반기금 | 2.7% (2025.7.1~) | 기획재정부 보도자료 2024-05-28 |
| 사회복지시설 감액 | 주택용·일반용 30% | 사이버한전 복지할인 안내 |
| 계약종별 적용 조건 | 약관 제56조·제57조·제60조 | 전기공급약관 제7장 |

## 확인이 필요한 부분

솔직하게 적어 둡니다. 쓰시는 분이 알고 쓰셔야 합니다.

1. **사회복지시설 감액 30%의 계산 기준** — 안내 페이지에는 「30%」만 있고, 기본요금·전력량요금에만 적용되는지 기후환경·연료비조정요금까지 포함되는지 세칙 원문을 확인하지 못했습니다. 이 계산기는 네 항목 합계에 적용합니다. 실제보다 감액이 크게 나올 수 있습니다.
2. **연료비조정단가**는 분기마다 바뀝니다. 2027년 1분기부터는 `tariff.json`의 `fuel_adj_won_per_kwh`를 확인하세요.
3. **전력산업기반기금 2.7%**는 2024년 5월 보도자료의 단계 인하 일정에 따른 값입니다. 전기사업법 시행령 원문으로 재확인하지 못했습니다.
4. 주택용 적용은 「계약전력 3kW 이하」 또는 「주거용」이 조건입니다. 경로당은 보통 3kW를 넘어 일반용이 되고, 이 경우 실익은 종별 변경보다 **감액 신청**에 있습니다. 계산기는 두 경로를 모두 보여줍니다.

## 로컬에서 열기 / 배포

```bash
git clone https://github.com/kosys0224-spec/kepco-rate-check.git
cd kepco-rate-check
# 그냥 index.html을 더블클릭해도 됩니다. 내장 요금표를 씁니다.
# 로컬 서버로 열면 data/tariff.json을 읽습니다.
python3 -m http.server 8000
```

GitHub Pages: 저장소 Settings → Pages → Branch `main` / root 로 켜면 `https://kosys0224-spec.github.io/kepco-rate-check/`에 올라갑니다.

## 요금 개정 시 갱신 방법

1. 사이버한전 요금표에서 바뀐 단가를 `data/tariff.json`에 반영하고 `meta.updated`와 각 `effective`를 고칩니다.
2. `index.html` 안의 `<script id="tariff-embedded">` 블록도 같은 내용으로 바꿉니다(파일로 직접 열 때 쓰는 내장값). 아래 한 줄로 동기화할 수 있습니다.

```bash
python3 -c "import re;h=open('index.html',encoding='utf-8').read();j=open('data/tariff.json',encoding='utf-8').read().strip();h=re.sub(r'(<script id=\"tariff-embedded\"[^>]*>)[\s\S]*?(</script>)',lambda m:m.group(1)+'\n'+j+'\n'+m.group(2),h);open('index.html','w',encoding='utf-8').write(h)"
```

## 검증

`tests/check.js`는 요금 산식을 한전 요금표 수기 계산과 대조합니다.

```bash
node tests/check.js
```

## 기여

- 세칙상 감액 계산 기준을 아시는 분, 고압·시간대별 요금 확장, 지자체 일괄 점검용 CSV 입력 기능 PR을 환영합니다.
- 요금 단가 오류는 이슈로 알려 주세요. 출처 URL과 확인일을 함께 적어 주시면 바로 반영합니다.

## 면책

이 도구는 참고용입니다. 실제 청구액은 검침 주기, 계약 조건, 요금 개정, 할인 중복 규칙에 따라 다를 수 있습니다. 계약종별 변경과 감액 신청의 가부는 한국전력공사가 판단합니다.

## 라이선스

MIT — `LICENSE` 참조. 요금 단가 자체는 한국전력공사 공개 자료입니다.

---

## English summary

**KEPCO Rate Class Checker** is a single-page, serverless web calculator that compares a Korean electricity customer's current KEPCO rate class (residential, general, educational, industrial, agricultural A/B) against alternatives and shows the annual bill difference, using published KEPCO tariffs. It was built to turn two award-winning local-government policy proposals (Icheon City and Goheung County, 2026) — on auditing rate classes and welfare-facility discounts for senior centers and farms — into a tool that officials and facility managers can use with nothing but a bill in hand. Tariffs, sources and effective dates live in `data/tariff.json`; the billing formula is unit-tested in `tests/check.js`. Known limitations are listed above in Korean.
