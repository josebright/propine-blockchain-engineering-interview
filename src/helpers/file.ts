import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import axios from "axios";


export const handleDir = (outDir: string, deleteFiles = false) => {
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  } else {
    if (deleteFiles) {
      const fileNames = readdirSync(outDir);
      fileNames.forEach((fileName) => {
        unlinkSync(join(outDir, fileName));
      });
    }
  }
};

export const getCurrencyRate = async() => {
  try{
    const {data} = await axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD')
    return data as Record<string, {USD: string}>

  } catch (error) {
    return undefined;
  }
}
