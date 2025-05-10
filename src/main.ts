import FlipClock from "flipclock";
import { getBingPaperData } from "@/api";
import "@/style/index.less";

new FlipClock(document.querySelector(".clock"), {
  face: "TwentyFourHourClock",
});

function updateImage() {
  getBingPaperData().then((images) => {
    const img = document.querySelector(".paper") as HTMLImageElement;
    const image = images[0];
    const url = `https://cn.bing.com${image.url}`;
    img.src = url;
  });
}

updateImage();

setInterval(() => {
  updateImage();
}, 10 * 60 * 1000);
