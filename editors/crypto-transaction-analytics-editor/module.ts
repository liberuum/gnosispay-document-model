import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the Todo List document type */
export const CryptoTransactionAnalyticsEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["crypto/transaction-analytics"],
  config: {
    id: "crypto-transaction-analytics-editor",
    name: "Crypto Transaction Analytics Editor",
  },
};
