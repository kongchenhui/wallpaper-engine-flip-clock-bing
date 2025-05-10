import FlipClock from "flipclock";
import { getBingPaperData } from "@/api";
import "@/style/index.less";

new FlipClock(document.querySelector(".clock"), {
  face: "TwentyFourHourClock",
});

updateImage();

setInterval(() => {
  updateImage();
}, 10 * 60 * 1000);

const position = {
  x: 50,
  y: 40,
  scale: 1,
};

window.wallpaperPropertyListener = {
  applyUserProperties: function (properties) {
    if (properties.position_x) {
      position.x = properties.position_x.value;
    }
    if (properties.position_y) {
      position.y = properties.position_y.value;
    }
    if (properties.scale) {
      position.scale = properties.scale.value;
    }
    updateClockPosition();
  },
};

function updateImage() {
  getBingPaperData().then((images) => {
    const img = document.querySelector(".paper") as HTMLImageElement;
    const image = images[0];
    const url = `https://cn.bing.com${image.url}`;
    img.src = url;
  });
}

function updateClockPosition() {
  const clock = document.querySelector(".clock") as HTMLElement;
  clock.style.left = `${position.x}%`;
  clock.style.top = `${position.y}%`;
  clock.style.scale = `${position.scale}`;
  clock.style.transformOrigin = `left top`;
}
