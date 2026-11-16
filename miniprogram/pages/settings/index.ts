/** 设置页：音效 / 背景音乐 / 震动 / 规则 / 版本信息。 */
import { audio } from '../../services/audio';
import * as store from '../../services/storage';

const VERSION = 'v0.1.0';

Page({
  data: {
    soundOn: true,
    musicOn: false,      // 首期恒定关闭：5 首 BGM 版权未授权
    musicDisabled: true,
    vibrateOn: true,
    version: VERSION,
    schema: 'mah-miniprogram-save',
  },
  onLoad() {
    const save = store.loadSave();
    this.setData({
      soundOn: save.settings.soundOn,
      musicOn: false,
      vibrateOn: save.settings.vibrateOn,
    });
  },
  persist() {
    const save = store.loadSave();
    save.settings = {
      soundOn: this.data.soundOn,
      musicOn: false,
      vibrateOn: this.data.vibrateOn,
    };
    store.writeSave(save);
  },
  onToggleSound(e: any) {
    const v = e.detail.value;
    this.setData({ soundOn: v });
    audio.setSound(v);
    this.persist();
  },
  onToggleVibrate(e: any) {
    const v = e.detail.value;
    this.setData({ vibrateOn: v });
    this.persist();
  },
  onMusicHint() {
    wx.showModal({
      title: '背景音乐',
      content: '原仓库的 5 首背景音乐尚未取得商业授权，首期未开放。当前为无音乐模式；音效不受影响。',
      showCancel: false,
    });
  },
  clearData() {
    const self = this;
    wx.showModal({
      title: '重置进度',
      content: '将清空本地战绩与设置（不影响桌面版）。确定继续？',
      success(res: any) {
        if (res.confirm) {
          store.clearSave();
          wx.showToast({ title: '已重置', icon: 'success' });
          self.setData({ soundOn: true, vibrateOn: true });
        }
      },
    });
  },
});
