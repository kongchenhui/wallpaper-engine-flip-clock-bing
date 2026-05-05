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

export async function getBingPaperData() {
  const res = await request(
    `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`,
    {
      method: "GET",
    });
  return res.images as BingImageData[];
}
