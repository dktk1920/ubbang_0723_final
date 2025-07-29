export function getDiaryDateFromTimestamp(ts: number): string {
  const date = new Date(ts);

  // UTC -> KST 보정
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

  const kstHour = kstDate.getUTCHours(); // KST 기준 시간
  if (kstHour < 6) {
    kstDate.setUTCDate(kstDate.getUTCDate() - 1);
  }

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
