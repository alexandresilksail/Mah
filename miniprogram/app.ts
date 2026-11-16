import { audio } from './services/audio';

App({
  globalData: {
    version: '0.1.0',
    lastResult: null,
  },
  onLaunch() {
    // 存储初始化采用惰性读取（各页面按需 loadSave），避免启动期 IO 阻塞。
    // 音频服务首期无 BGM：仅初始化开关状态，不加载任何原仓库音乐素材。
    audio.init({ soundOn: true, musicOn: false });
  },
  onShow() {
    audio.onShow();
  },
  onHide() {
    audio.onHide();
    audio.release();
  },
});
