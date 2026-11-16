/** 微信平台能力适配：震动、系统信息、页面跳转。集中管理便于测试替换。 */

export function vibrate(enabled: boolean, type: 'light' | 'heavy' = 'light'): void {
  if (!enabled) return;
  try {
    if (type === 'heavy') wx.vibrateLong({});
    else wx.vibrateShort({ type: 'light' });
  } catch (e) { /* 不支持震动：安全降级 */ }
}

export function getWindowInfo(): { width: number; height: number; pixelRatio: number; safeTop: number; safeBottom: number } {
  let width = 375, height = 667, pixelRatio = 2, safeTop = 0, safeBottom = 0;
  try {
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    width = info.windowWidth || info.screenWidth || width;
    height = info.windowHeight || info.screenHeight || height;
    pixelRatio = info.pixelRatio || 2;
    safeTop = info.safeArea ? info.safeArea.top : (info.statusBarHeight || 0);
    if (info.safeArea && typeof info.safeArea.bottom === 'number') {
      safeBottom = Math.max(0, height - info.safeArea.bottom);
    }
  } catch (e) { /* ignore */ }
  return { width, height, pixelRatio, safeTop, safeBottom };
}

export function navigate(url: string): void {
  wx.navigateTo({ url });
}
export function redirect(url: string): void {
  wx.redirectTo({ url });
}
export function goHome(): void {
  try { wx.navigateBack({ delta: 10 }); } catch (e) { /* ignore */ }
}

/** 通过全局事件总线在页面间传递最近一局结果（避免 URL 长度与编码问题） */
const app = getApp<IAppOption>();
export function setResult(data: any): void {
  app.globalData.lastResult = data;
}
export function getResult(): any {
  return app.globalData.lastResult || null;
}
