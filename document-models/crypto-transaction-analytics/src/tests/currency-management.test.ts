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
  setBaseCurrency,
  SetBaseCurrencyInputSchema,
} from "ba-workshop/document-models/crypto-transaction-analytics";

describe("CurrencyManagement Operations", () => {
  it("should handle setBaseCurrency operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetBaseCurrencyInputSchema());

    const updatedDocument = reducer(document, setBaseCurrency(input));

    expect(isCryptoTransactionAnalyticsDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_BASE_CURRENCY",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
