export interface GetLatestValuePayload {
  timeStamp: number;
  value: number;
  type: TransactionType;
}
export type TransactionType = "DEPOSIT" | "WITHDRAWAL";


