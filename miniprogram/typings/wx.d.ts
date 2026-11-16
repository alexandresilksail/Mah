/**
 * 微信小程序全局类型的最小声明（本地类型检查用）。
 * 真机编译以微信开发者工具内置类型为准；这里只覆盖本项目实际使用的 API。
 */
declare const wx: any;
declare function App(o: any): void;
declare function Page(o: any): void;
declare function Component(o: any): void;
declare function getApp<T>(): T;
declare function getCurrentPages(): any[];
declare const require: (p: string) => any;
declare const module: any;
declare const console: { log(...a: any[]): void; error(...a: any[]): void; warn(...a: any[]): void; info(...a: any[]): void };
declare function setTimeout(fn: (...a: any[]) => void, ms: number): any;
declare function clearTimeout(id: any): void;

interface IAppOption {
  globalData: {
    version: string;
    [key: string]: any;
  };
}
