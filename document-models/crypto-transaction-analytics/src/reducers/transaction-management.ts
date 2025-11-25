import {
  InvalidCsvFormatError,
  TransactionNotFoundError,
} from "../../gen/transaction-management/error.js";
import type { TransactionStatus } from "../../gen/schema/index.js";
import type { CryptoTransactionAnalyticsTransactionManagementOperations } from "ba-workshop/document-models/crypto-transaction-analytics";

export const cryptoTransactionAnalyticsTransactionManagementOperations: CryptoTransactionAnalyticsTransactionManagementOperations =
  {
    importCsvTransactionsOperation(state, action) {
      if (!action.input.csvData || action.input.csvData.trim().length === 0) {
        throw new InvalidCsvFormatError("CSV data is required");
      }

      const transactions = [];
      const csvLines = action.input.csvData.trim().split("\n");

      if (csvLines.length < 2) {
        throw new InvalidCsvFormatError(
          "CSV must contain header row and at least one data row",
        );
      }

      const headers = csvLines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      let transactionIndex = 0;

      for (let i = 1; i < csvLines.length; i++) {
        const line = csvLines[i].trim();
        if (!line) continue;

        if (transactionIndex >= action.input.transactionIds.length) {
          throw new InvalidCsvFormatError(
            "Not enough transaction IDs provided for CSV data",
          );
        }

        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        if (values.length !== headers.length) continue;

        const txData: Record<string, string> = {};
        headers.forEach((header, index) => {
          txData[header] = values[index];
        });

        const transaction = {
          id: action.input.transactionIds[transactionIndex],
          txHash: txData["Transaction Hash"] || txData["TxHash"] || "",
          blockNumber: txData["Blockno"] || txData["Block Number"] || "",
          timestamp:
            txData["DateTime (UTC)"] ||
            txData["DateTime"] ||
            action.input.timestamp,
          fromAddress: txData["From"] || null,
          toAddress: txData["To"] || null,
          contractAddress: txData["ContractAddress"] || null,
          valueIn: txData["Value_IN(x)"]
            ? {
                amount: parseFloat(txData["Value_IN(x)"]) || 0,
                token: txData["TokenSymbol"] || "ETH",
                usdValue: null,
              }
            : null,
          valueOut: txData["Value_OUT(x)"]
            ? {
                amount: parseFloat(txData["Value_OUT(x)"]) || 0,
                token: txData["TokenSymbol"] || "ETH",
                usdValue: null,
              }
            : null,
          txnFee: {
            amount:
              parseFloat(txData["TxnFee(DAI)"]) ||
              parseFloat(txData["TxnFee(USD)"]) ||
              0,
            token: txData["TxnFee(DAI)"] ? "DAI" : "USD",
            usdValue: null,
          },
          historicalPrice: txData["Historical $P"]
            ? {
                amount: parseFloat(txData["Historical $P"]),
                currency: "USD",
              }
            : null,
          currentValue: txData["CurrentValue TxnFee(x)"]
            ? {
                amount: parseFloat(txData["CurrentValue TxnFee(x)"]),
                currency: "USD",
              }
            : null,
          convertedValue: null,
          status: (txData["Status"] === "1" || txData["Status"] === "Success"
            ? "SUCCESS"
            : "FAILED") as TransactionStatus,
          errorCode: txData["ErrCode"] || null,
          method: txData["Method"] || null,
        };

        transactions.push(transaction);
        transactionIndex++;
      }

      state.transactions.push(...transactions);

      if (transactions.length > 0) {
        const timestamps = transactions
          .map((t) => new Date(t.timestamp).getTime())
          .filter((t) => !isNaN(t));
        state.metadata = {
          importedAt: action.input.timestamp,
          totalTransactions: state.transactions.length,
          dateRange:
            timestamps.length > 0
              ? {
                  startDate: new Date(Math.min(...timestamps))
                    .toISOString()
                    .split("T")[0],
                  endDate: new Date(Math.max(...timestamps))
                    .toISOString()
                    .split("T")[0],
                }
              : null,
        };
      } else {
        state.metadata = {
          importedAt: action.input.timestamp,
          totalTransactions: state.transactions.length,
          dateRange: null,
        };
      }
    },
    addTransactionOperation(state, action) {
      const transaction = {
        id: action.input.id,
        txHash: action.input.txHash,
        blockNumber: action.input.blockNumber,
        timestamp: action.input.timestamp,
        fromAddress: action.input.fromAddress || null,
        toAddress: action.input.toAddress || null,
        contractAddress: action.input.contractAddress || null,
        valueIn: action.input.valueIn
          ? {
              ...action.input.valueIn,
              usdValue: action.input.valueIn.usdValue || null,
            }
          : null,
        valueOut: action.input.valueOut
          ? {
              ...action.input.valueOut,
              usdValue: action.input.valueOut.usdValue || null,
            }
          : null,
        txnFee: {
          ...action.input.txnFee,
          usdValue: action.input.txnFee.usdValue || null,
        },
        historicalPrice: action.input.historicalPrice || null,
        currentValue: action.input.currentValue || null,
        convertedValue: action.input.convertedValue || null,
        status: action.input.status,
        errorCode: action.input.errorCode || null,
        method: action.input.method || null,
      };

      state.transactions.push(transaction);

      // Update metadata
      state.metadata = {
        importedAt: state.metadata?.importedAt || action.input.timestamp,
        totalTransactions: state.transactions.length,
        dateRange: state.metadata?.dateRange || {
          startDate: action.input.timestamp.split("T")[0],
          endDate: action.input.timestamp.split("T")[0],
        },
      };
    },
    updateTransactionOperation(state, action) {
      const transactionIndex = state.transactions.findIndex(
        (t) => t.id === action.input.id,
      );
      if (transactionIndex === -1) {
        throw new TransactionNotFoundError(
          `Transaction with ID ${action.input.id} not found`,
        );
      }

      const transaction = state.transactions[transactionIndex];
      if (action.input.txHash) transaction.txHash = action.input.txHash;
      if (action.input.blockNumber)
        transaction.blockNumber = action.input.blockNumber;
      if (action.input.timestamp)
        transaction.timestamp = action.input.timestamp;
      if (action.input.fromAddress !== undefined)
        transaction.fromAddress = action.input.fromAddress;
      if (action.input.toAddress !== undefined)
        transaction.toAddress = action.input.toAddress;
      if (action.input.contractAddress !== undefined)
        transaction.contractAddress = action.input.contractAddress;
      if (action.input.valueIn !== undefined)
        transaction.valueIn = action.input.valueIn
          ? {
              ...action.input.valueIn,
              usdValue: action.input.valueIn.usdValue || null,
            }
          : null;
      if (action.input.valueOut !== undefined)
        transaction.valueOut = action.input.valueOut
          ? {
              ...action.input.valueOut,
              usdValue: action.input.valueOut.usdValue || null,
            }
          : null;
      if (action.input.txnFee)
        transaction.txnFee = {
          ...action.input.txnFee,
          usdValue: action.input.txnFee.usdValue || null,
        };
      if (action.input.historicalPrice !== undefined)
        transaction.historicalPrice = action.input.historicalPrice;
      if (action.input.currentValue !== undefined)
        transaction.currentValue = action.input.currentValue;
      if (action.input.convertedValue !== undefined)
        transaction.convertedValue = action.input.convertedValue;
      if (action.input.status) transaction.status = action.input.status;
      if (action.input.errorCode !== undefined)
        transaction.errorCode = action.input.errorCode;
      if (action.input.method !== undefined)
        transaction.method = action.input.method;
    },
    deleteTransactionOperation(state, action) {
      const transactionIndex = state.transactions.findIndex(
        (t) => t.id === action.input.id,
      );
      if (transactionIndex === -1) {
        throw new TransactionNotFoundError(
          `Transaction with ID ${action.input.id} not found`,
        );
      }

      state.transactions.splice(transactionIndex, 1);

      // Update metadata
      state.metadata = {
        importedAt: state.metadata?.importedAt || new Date().toISOString(),
        totalTransactions: state.transactions.length,
        dateRange: state.metadata?.dateRange || null,
      };
    },
  };
