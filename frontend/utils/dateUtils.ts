export function getDiaryDateFromTimestamp(ts: number): string {
  // UTC 시간 기준 Date 생성
  const utcDate = new Date(ts);

  // KST 시간으로 변환
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstDate = new Date(utcDate.getTime() + kstOffsetMs);

  // KST 기준 6시 이전이면 하루 전날로 조정
  if (kstDate.getHours() < 6) {
    kstDate.setDate(kstDate.getDate() - 1);
  }

  // YYYY-MM-DD 형식 반환
  return kstDate.toISOString().slice(0, 10);
}


// export function getDiaryDateFromTimestamp(ts: number): string {
//   const utcDate = new Date(ts);
//   const kstTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
//
//   if (kstTime.getHours() < 6) {
//     kstTime.setDate(kstTime.getDate() - 1);
//   }
//
//   return kstTime.toISOString().slice(0, 10);
// }
