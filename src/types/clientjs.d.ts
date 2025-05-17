declare module 'clientjs' {
  export default class ClientJS {
    constructor();
    getFingerprint(): string;
    getBrowser(): string;
    getBrowserVersion(): string;
    getOS(): string;
    getOSVersion(): string;
    getDeviceType(): string;
    getScreenPrint(): string;
    getTimeZone(): string;
    getLanguage(): string;
  }
} 