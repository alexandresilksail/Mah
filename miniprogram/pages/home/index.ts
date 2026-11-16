/** 首页：品牌标识 + 关卡入口 + 规则 + 设置入口。 */
import { navigate } from '../../services/platform';
import * as store from '../../services/storage';

Page({
  data: {
    version: 'v0.1.0',
    bestLevel: 1,
    wins: 0,
    showRules: false,
  },
  onShow() {
    const save = store.loadSave();
    this.setData({ bestLevel: save.bestLevel, wins: save.wins });
  },
  startLevel1() {
    navigate('/pages/game/index?level=1&reason=title_screen_restart');
  },
  startLevel2() {
    navigate('/pages/game/index?level=2&reason=title_screen_restart');
  },
  openSettings() {
    navigate('/pages/settings/index');
  },
  toggleRules() {
    this.setData({ showRules: !this.data.showRules });
  },
  onShareAppMessage() {
    return { title: 'MAH · 麻了个麻 — 堆叠三消，看你能走到第几关', path: '/pages/home/index' };
  },
});
