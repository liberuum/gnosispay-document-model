import type { CryptoTransactionAnalyticsAnalyticsOperations } from "ba-workshop/document-models/crypto-transaction-analytics";

export const cryptoTransactionAnalyticsAnalyticsOperations: CryptoTransactionAnalyticsAnalyticsOperations =
  {
    calculateAnalyticsOperation(state, action) {
      const transactions = state.transactions;
      if (transactions.length === 0) {
        state.analytics = {
          totalSpent: null,
          averageTransaction: null,
          transactionsByToken: [],
          monthlyBreakdown: [],
        };
        return;
      }

      // Calculate total spent
      let totalAmount = 0;
      const tokenAmounts: Record<string, number> = {};
      const monthlyAmounts: Record<string, number> = {};

      transactions.forEach((tx) => {
        // Use converted values if available, otherwise use original values
        let amount = 0;
        const token = action.input.baseCurrency;

        if (tx.convertedValue) {
          amount = tx.convertedValue.amount;
        } else if (
          tx.valueOut &&
          tx.valueOut.token === action.input.baseCurrency
        ) {
          amount = tx.valueOut.amount;
        } else if (
          tx.valueOut &&
          tx.valueOut.usdValue &&
          action.input.baseCurrency === "USD"
        ) {
          amount = tx.valueOut.usdValue;
        }

        if (amount > 0) {
          totalAmount += amount;

          // Track by original token
          const originalToken = tx.valueOut?.token || "Unknown";
          tokenAmounts[originalToken] =
            (tokenAmounts[originalToken] || 0) + (tx.valueOut?.amount || 0);

          // Track monthly breakdown
          const month = new Date(tx.timestamp).toISOString().substring(0, 7); // YYYY-MM
          monthlyAmounts[month] = (monthlyAmounts[month] || 0) + amount;
        }
      });

      // Build analytics
      state.analytics = {
        totalSpent:
          totalAmount > 0
            ? {
                amount: totalAmount,
                token: action.input.baseCurrency,
                usdValue:
                  action.input.baseCurrency === "USD" ? totalAmount : null,
              }
            : null,
        averageTransaction:
          totalAmount > 0
            ? {
                amount: totalAmount / transactions.length,
                token: action.input.baseCurrency,
                usdValue:
                  action.input.baseCurrency === "USD"
                    ? totalAmount / transactions.length
                    : null,
              }
            : null,
        transactionsByToken: Object.entries(tokenAmounts).map(
          ([token, amount]) => ({
            amount,
            token,
            usdValue: null,
          }),
        ),
        monthlyBreakdown: Object.entries(monthlyAmounts).map(
          ([month, amount]) => ({
            amount,
            token: action.input.baseCurrency,
            usdValue: action.input.baseCurrency === "USD" ? amount : null,
          }),
        ),
      };
    },
  };
