declare module "flipclock" {
  const FlipClock: any;
  export default FlipClock;
}
declare interface Window {
  wallpaperPropertyListener?: {
    applyUserProperties: (properties: Record<string, any>) => void;
  };
}
