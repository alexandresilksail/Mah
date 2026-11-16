/** 结算页：胜负 / 耗时 / 牌局编号 / 关卡 / 再玩一次 / 返回首页 / 分享。 */
import { getResult, redirect, goHome } from '../../services/platform';
import { gameShare } from '../../services/share';

Page({
  data: {
    won: false,
    levelId: '1',
    templateId: '' as string,
    seed: '' as string,
    sessionId: '' as string,
    duration: '00:00',
    totalTiles: 0,
    revived: false,
  },
  onLoad() {
    const r = getResult() || {};
    const sec = Math.max(0, Math.round((r.durationMs || 0) / 1000));
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    this.setData({
      won: !!r.won,
      levelId: r.levelId || '?',
      templateId: r.templateId || '—',
      seed: r.seed || '—',
      sessionId: (r.sessionId || '').slice(0, 16),
      duration: mm + ':' + ss,
      totalTiles: r.totalTiles || 0,
      revived: !!r.revived,
    });
  },
  replay() {
    const level = this.data.levelId === '2' ? 2 : 1;
    const reason = this.data.won ? 'new_game' : 'failure_restart';
    redirect('/pages/game/index?level=' + level + '&reason=' + reason);
  },
  backHome() { goHome(); },
  onShareAppMessage() {
    return gameShare({
      won: this.data.won, levelId: this.data.levelId,
      durationMs: 0, sessionId: this.data.sessionId, totalTiles: this.data.totalTiles,
    });
  },
});
