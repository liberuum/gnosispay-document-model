import type { DocumentModelModule } from "document-model";
import { CryptoTransactionAnalytics } from "./crypto-transaction-analytics/module.js";

export const documentModels: DocumentModelModule<any>[] = [
  CryptoTransactionAnalytics,
];
