import fs, { createWriteStream, WriteStream } from "fs";
import { join } from "path";
import readline from "readline";
import { resourceLimits } from "worker_threads";
import { calculateValue, handleDir, getCurrencyRate } from "../helpers";
import {
  GetLatestValueForAToken,
  GetLatestValueForTokens,
  GetValue,
  GetValueForATokenOnADate,
  GetValueForTokensOnADate,
  TransactionType,
} from "../interface";



const outDir = join("temp");

export class AnalyzeInvestment {
  private fileName: string;
  private outDir: string;

  constructor(fileName: string) {
    this.fileName = fileName;
    handleDir(outDir);
    this.outDir = join(outDir, fileName.replace(".csv", ""));
    handleDir(this.outDir, true);
  }

  analyze = async () => {
    return new Promise((resolve: (v: AnalyzeInvestment) => void, reject) => {
      try {
        console.log("===============ANALYZING FILE===============");
        const inStream = fs.createReadStream(join("assets", this.fileName));
        const inStreamLine = readline.createInterface(inStream);
        const outStreams: Record<string, WriteStream> = {};
        let isFirstLineRead = false;
        const previous: Record<string, number> = {};

        /**
         * Read each line
         */
        inStreamLine.on("line", (chunk) => {
          if (isFirstLineRead) {
            const [timeStamp, transactionType, token, amount] = chunk.split(
              ","
            ) as [string, TransactionType, string, number];

            /**
             * Break down file into smaller files using date
             */
            const dateObj = new Date(Number(timeStamp));
            const dateString = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
            if (!outStreams[dateString]) {
              outStreams[dateString] = createWriteStream(
                join(this.outDir, dateString)
              );
            }
            const value = calculateValue(
              transactionType,
              Number(amount),
              previous[token]
            );

            previous[token] = value;
            outStreams[dateString].write(`${timeStamp},${token},${amount}\n`);
          }
          isFirstLineRead = true;
        });

        inStream.on("end", () => {
          Object.values(outStreams).forEach((s) => s.close());
          console.log("===============ANALYZING FILE COMPLETED===============");
          resolve(this);
        });
      } catch (error) {
        const err = error as Error;
        reject(err.message);
      }
    });
  };

  getValue: GetValue = async (payload) => {
    if (!payload) {
      return await this.getLatestValueForTokens(payload);
    }
    if ("token" in payload && !("date" in payload)) {
      return await this.getLatestValueForAToken(payload);
    }
    if ("date" in payload && !("token" in payload)) {
      return await this.getValueForTokensOnADate(payload);
    }

    return await this.getValueForATokenOnADate(payload);
  };

  private getLatestValueForTokens: GetLatestValueForTokens = async () => {
    const usdRates = await getCurrencyRate();
    if(!usdRates){
      throw new Error("USD rate not gotten");
    }
    const res = await new Promise(
      (resolve: (v: Record<string, number>) => void, reject) => {
        try {
          const fileNames = fs.readdirSync(this.outDir);

          const inStream = fs.createReadStream(
            join("temp", this.fileName.replace(".csv", ""), fileNames[0])
          );
          const inStreamLine = readline.createInterface(inStream);
          const res: Record<string, number> = {};
          inStreamLine.on("line", (chunk) => {
            const [, token, amount] = chunk.split(",");
            res[token] = Number(amount);
          });
          inStream.on("end", () => {
            resolve(res);
          });
        } catch (err) {
          reject((err as any).message);
        }
      }
    );
    Object.entries(res).forEach(([key, value]) => {
        res[key] = value * Number(usdRates[key].USD || 0)
    })
    return res
  };

  private getLatestValueForAToken: GetLatestValueForAToken = async ({
    token,
  }) => {
    const usdRates = await getCurrencyRate();
    if(!usdRates){
      throw new Error("USD rate not gotten");
    }
    const res = await new Promise((resolve: (v: number) => void, reject) => {
      try {
        const fileNames = fs.readdirSync(this.outDir);

        const inStream = fs.createReadStream(
          join("temp", this.fileName.replace(".csv", ""), fileNames[0])
        );
        const inStreamLine = readline.createInterface(inStream);
        let res = "";
        inStreamLine.on("line", (chunk) => {
          const [, t, amount] = chunk.split(",");
          if (token === t) {
            res = amount;
          }
        });
        inStream.on("end", () => {
          resolve(Number(res));
        });
      } catch (err) {
        reject((err as any).message);
      }
    });
    return res * Number(usdRates[token].USD);
  };

  private getValueForTokensOnADate: GetValueForTokensOnADate = async ({
    date,
  }) => {
    const usdRates = await getCurrencyRate();
    if(!usdRates){
      throw new Error("USD rate not gotten");
    }
    const res = await new Promise(
      (resolve: (v: Record<string, number>) => void, reject) => {
        try {
          const dateObj = new Date(date);

          const dateString = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

          const inStream = fs.createReadStream(
            join("temp", this.fileName.replace(".csv", ""), dateString)
          );
          const inStreamLine = readline.createInterface(inStream);
          const res: Record<string, number> = {};
          inStreamLine.on("line", (chunk) => {
            const [, token, amount] = chunk.split(",");
            res[token] = Number(amount);
          });
          inStream.on("end", () => {
            resolve(res);
          });
        } catch (err) {
          reject((err as any).message);
        }
      }
    );
    Object.entries(res).forEach(([key, value]) => {
        res[key] = value * Number(usdRates[key].USD || 0)
    })
    return res
  };

  private getValueForATokenOnADate: GetValueForATokenOnADate = async ({
    date,
    token,
  }) => {
    const usdRates = await getCurrencyRate();
    if(!usdRates){
      throw new Error("USD rate not gotten");
    }
    const res = await new Promise((resolve: (v: number) => void, reject) => {
      try {
        const dateObj = new Date(date);

        const dateString = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

        const inStream = fs.createReadStream(
          join("temp", this.fileName.replace(".csv", ""), dateString)
        );
        const inStreamLine = readline.createInterface(inStream);
        let res = "";
        inStreamLine.on("line", (chunk) => {
          const [, t, amount] = chunk.split(",");
          if (token === t) {
            res = amount;
          }
        });
        inStream.on("end", () => {
          resolve(Number(res));
        });
      } catch (err) {
        reject((err as any).message);
      }
    });
    return res * Number(usdRates[token].USD);
  };
}
