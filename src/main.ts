import FlipClock from "flipclock";
import { getBingPaperData } from "@/api";
import "@/style/index.less";

const position = {
  x: 50,
  y: 40,
  scale: 1,
};

let isCustomWallpaper = false;

let timer: number | null = null;

new FlipClock(document.querySelector(".clock"), {
  face: "TwentyFourHourClock",
});

setInterval(() => {
  queryImageData();
}, 10 * 60 * 1000);

queryImageData();

startInterval();

window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {
    if (properties.position_x) {
      position.x = properties.position_x.value;
      updateClockPosition();
    }
    if (properties.position_y) {
      position.y = properties.position_y.value;
      updateClockPosition();
    }
    if (properties.scale) {
      position.scale = properties.scale.value;
      updateClockPosition();
    }
    if (properties.custom_wallpaper) {
      if (!properties.custom_wallpaper.value) {
        isCustomWallpaper = false;
        queryImageData();
        startInterval();
        return;
      }
      isCustomWallpaper = true;
      stopInterval();
      var customWallpaper = "file:///" + properties.custom_wallpaper.value;
      updateImageSrc(customWallpaper);
    }
  },
};

function queryImageData() {
  if (isCustomWallpaper) {
    stopInterval();
    return;
  }
  getBingPaperData().then((images) => {
    const image = images[0];
    const url = `https://cn.bing.com${image.url}`;
    if (isCustomWallpaper) {
      stopInterval();
      return;
    }
    updateImageSrc(url);
  });
}

function updateClockPosition() {
  const clock = document.querySelector(".clock") as HTMLElement;
  clock.style.left = `${position.x}%`;
  clock.style.top = `${position.y}%`;
  clock.style.scale = `${position.scale}`;
  clock.style.transformOrigin = `left top`;
}

function updateImageSrc(src: string) {
  const img = document.querySelector(".paper") as HTMLImageElement;
  img.src = src;
}

function startInterval() {
  if (timer) {
    window.clearInterval(timer);
  }
  timer = window.setInterval(() => {
    queryImageData();
  }, 5 * 60 * 1000);
}

function stopInterval() {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
}
