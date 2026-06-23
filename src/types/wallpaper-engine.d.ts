declare interface Window {
  wallpaperPropertyListener?: {
    applyUserProperties: (properties: Record<string, any>) => void;
  };
}
