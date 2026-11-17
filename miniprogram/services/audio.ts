/**
 * 微信端音频服务 — 独立适配接口（指令第九步）。
 *
 * 知识产权红线：
 *  · 原仓库 src/assets/music/ 下 5 首背景音乐为商业发行阻断项，未取得授权；
 *    本服务【不引用、不打包、不播放】这 5 首音乐，也不做任何改名/重编码规避。
 *  · musicOn 开关保留，但首期恒定无音乐（no-op），为将来接入原创/已授权音乐
 *    预留接口；界面上明确标注「背景音乐（暂未开放）」。
 *
 * 音效：使用 wx.createInnerAudioContext 播放内置原创短音（若未提供素材则安全降级
 * 为静音），支持开关、前后台切换、释放、防重复。
 */

type SfxName = 'pick' | 'match' | 'deny' | 'win' | 'lose' | 'shuffle' | 'undo' | 'remove' | 'revive';

class AudioService {
  private soundOn = true;
  private musicOn = false;
  private inForeground = true;
  private ctxCache: { [k: string]: any } = {};
  private playing: { [k: string]: boolean } = {};
  /** 音效资源表：相对 miniprogram 根路径。首期为空 = 全部安全降级为静音 */
  private sources: { [k in SfxName]?: string } = {};

  init(settings: { soundOn: boolean; musicOn: boolean }): void {
    this.soundOn = !!settings.soundOn;
    // 首期强制无音乐（版权未授权）
    this.musicOn = false;
  }

  setSound(on: boolean): void { this.soundOn = !!on; }
  setMusic(on: boolean): void { void on; this.musicOn = false; }
  isMusicEnabled(): boolean { return this.musicOn; }
  /** 音效音量（0~1）。首期素材为空=静音，仅记录状态，为后续接入原创音效预留。 */
  setVolume(v: number): void { void v; }

  /** 页面切前台 */
  onShow(): void { this.inForeground = true; }
  /** 页面切后台：停止所有音频 */
  onHide(): void {
    this.inForeground = false;
    this.stopAll();
  }

  play(name: SfxName): void {
    if (!this.soundOn || !this.inForeground) return;
    const src = this.sources[name];
    if (!src) return; // 无素材：安全降级为静音
    if (this.playing[name]) return; // 防重复
    try {
      let ctx = this.ctxCache[name];
      if (!ctx) {
        ctx = wx.createInnerAudioContext();
        ctx.src = src;
        ctx.onError(() => { this.playing[name] = false; });
        ctx.onEnded(() => { this.playing[name] = false; });
        this.ctxCache[name] = ctx;
      }
      this.playing[name] = true;
      ctx.stop();
      ctx.play();
    } catch (e) {
      this.playing[name] = false; // 不支持音频：安全降级
    }
  }

  // Game 引擎通过 this.audio?.xxx() 调用的适配方法
  pick(): void { this.play('pick'); }
  match(): void { this.play('match'); }
  deny(): void { this.play('deny'); }
  win(): void { this.play('win'); }
  lose(): void { this.play('lose'); }
  shuffle(): void { this.play('shuffle'); }
  undo(): void { this.play('undo'); }
  remove(): void { this.play('remove'); }
  revive(): void { this.play('revive'); }

  stopAll(): void {
    for (const k in this.playing) {
      if (this.playing[k]) {
        try { this.ctxCache[k]?.stop(); } catch (e) { /* ignore */ }
        this.playing[k] = false;
      }
    }
  }

  /** 页面卸载 / App 隐藏时释放所有音频上下文 */
  release(): void {
    this.stopAll();
    for (const k in this.ctxCache) {
      try { this.ctxCache[k]?.destroy(); } catch (e) { /* ignore */ }
    }
    this.ctxCache = {};
  }
}

export const audio = new AudioService();
