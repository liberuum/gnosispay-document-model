/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { describe, it, expect } from "vitest";
import { generateMock } from "@powerhousedao/codegen";
import {
  reducer,
  utils,
  isCryptoTransactionAnalyticsDocument,
  importCsvTransactions,
  ImportCsvTransactionsInputSchema,
} from "ba-workshop/document-models/crypto-transaction-analytics";

describe("TransactionManagement Operations", () => {
  it("should handle importCsvTransactions operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ImportCsvTransactionsInputSchema());

    const updatedDocument = reducer(document, importCsvTransactions(input));

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "IMPORT_CSV_TRANSACTIONS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
