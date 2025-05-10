import { request } from "../utils/request";

interface BingImageData {
  startdate: string;
  fullstartdate: string;
  enddate: string;
  url: string;
  urlbase: string;
  copyright: string;
  copyrightlink: string;
  title: string;
  quiz: string;
  wp: boolean;
  hsh: string;
  drk: number;
  top: number;
  bot: number;
  hs: any[];
}

export function getBingPaperData() {
  return request(
    "https:/raw.onmicrosoft.cn/Bing-Wallpaper-Action/main/data/zh-CN_update.json",
    {
      method: "GET",
    }
  ).then((res) => {
    return res.images as BingImageData[];
  });
}
