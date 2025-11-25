import { type SignalDispatch } from "document-model";
import {
  type ImportCsvTransactionsAction,
  type AddTransactionAction,
  type UpdateTransactionAction,
  type DeleteTransactionAction,
} from "./actions.js";
import { type CryptoTransactionAnalyticsState } from "../types.js";

export interface CryptoTransactionAnalyticsTransactionManagementOperations {
  importCsvTransactionsOperation: (
    state: CryptoTransactionAnalyticsState,
    action: ImportCsvTransactionsAction,
    dispatch?: SignalDispatch,
  ) => void;
  addTransactionOperation: (
    state: CryptoTransactionAnalyticsState,
    action: AddTransactionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTransactionOperation: (
    state: CryptoTransactionAnalyticsState,
    action: UpdateTransactionAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteTransactionOperation: (
    state: CryptoTransactionAnalyticsState,
    action: DeleteTransactionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
