export function getDiaryDateFromTimestamp(ts: number): string {
  // 클라이언트는 KST 기준이므로, 추가 보정 필요 없음
  const date = new Date(ts);

  // KST 기준 6시 이전이면 하루 전날로 보정
  if (date.getHours() < 6) {
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().slice(0, 10);
}