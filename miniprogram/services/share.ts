/** 分享服务：统一构造分享内容，不收集个人信息。 */

export function gameShare(result?: {
  won?: boolean; levelId?: string; durationMs?: number;
  sessionId?: string; totalTiles?: number;
}): { title: string; path: string; imageUrl?: string } {
  let title = 'MAH · 麻了个麻 — 堆叠三消，看你能走到第几关';
  if (result) {
    const sec = Math.max(0, Math.round((result.durationMs || 0) / 1000));
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    title = result.won
      ? `我在 MAH 通关了第 ${result.levelId || '?'} 关！用时 ${mm}:${ss}，来挑战我`
      : `MAH 第 ${result.levelId || '?'} 关差一点就过了，敢来试试吗？`;
  }
  return { title, path: '/pages/home/index' };
}
