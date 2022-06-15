import { AnalyzeInvestment } from "./lib";

const fileName = "transactions.csv";

const init = async () => {
  if (!fileName) {
    return;
  }
  const res = await new AnalyzeInvestment(fileName).analyze();
  const value = await res.getValue({date: "1970-01-19", token: "BTC"});
  console.log({ value });
};

init();
