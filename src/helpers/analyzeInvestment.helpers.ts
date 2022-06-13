import { TransactionType } from "../interface";

export const calculateValue = (
  type: TransactionType,
  present: number,
  previous = 0
): number => {
  if (type === "DEPOSIT") {
    return present + previous;
  }

  return previous - present;
};
