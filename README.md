# GnosisPay Powerhouse Analyser

A sophisticated transaction analytics tool built with Powerhouse for GnosisPay users. Track, analyze, and visualize your crypto card spending with comprehensive transaction analytics, interactive charts, and multi-token support.

## 🚀 Features

### 📊 Interactive Analytics Dashboard
- **Balance Timeline**: Interactive chart with hover tooltips showing date and amount details
- **Monthly Overview**: Last 6 months of income/expense breakdown with color-coded visualization
- **Token Analytics**: Comprehensive analysis grouped by contract address and token type
- **Transaction Insights**: Detailed transaction history with smart filtering

### 📁 Data Management
- **CSV Import**: Supports various CSV formats from exchanges and wallets
- **Smart Parsing**: Automatically detects and maps common CSV column formats
- **Address Tracking**: Configurable wallet address tracking with exclusion filters
- **Multi-token Support**: Handles multiple cryptocurrencies and tokens

### 🔧 Technical Features
- **Environment-based Configuration**: Secure address management via environment variables
- **Real-time Updates**: Live transaction processing and analytics updates
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gnosispay-powerhouse-analyser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your addresses
   nano .env
   ```

4. **Start Development Server**
   ```bash
   npm run vetra
   ```

5. **Open in Browser**
   Navigate to the localhost URL shown in your terminal

## 🔧 Environment Configuration

The application requires environment variables for secure address management:

```bash
# Tracked ETH Address - The main wallet address to track in analytics
VITE_TRACKED_ETH_ADDRESS=your_wallet_address_here

# Excluded Contract Address - Contract address to exclude from analysis
VITE_EXCLUDED_CONTRACT_ADDRESS=excluded_contract_address_here
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_TRACKED_ETH_ADDRESS` | Main Ethereum wallet address to track | Yes |
| `VITE_EXCLUDED_CONTRACT_ADDRESS` | Contract address to exclude (e.g., spam contracts) | Yes |

## 📊 Usage

### Importing Transactions

1. **Prepare CSV Data**
   - Export transaction data from your exchange or wallet
   - Ensure CSV contains standard columns: Transaction Hash, DateTime, Amount, Token, etc.

2. **Upload via Interface**
   - Use the CSV upload component in the application
   - The system automatically detects and maps column formats
   - Review the preview before confirming import

3. **Analyze Results**
   - View interactive charts and analytics
   - Explore monthly breakdowns and token-specific insights
   - Use hover tooltips for detailed transaction information

### Supported CSV Formats

The analyzer supports common CSV formats from:
- Cryptocurrency exchanges (Coinbase, Binance, Kraken, etc.)
- Wallet providers (MetaMask exports, hardware wallet software)
- Custom formats with standard column naming

Expected columns include:
- `Transaction Hash` / `TxHash` / `Hash`
- `DateTime (UTC)` / `Timestamp` / `Date`
- `Value_OUT` / `Amount_OUT` / `Amount`
- `Value_IN` / `Amount_IN`
- `Token Symbol` / `Asset` / `Currency`
- `Txn Fee` / `Fee`
- `Status` / `State`

## 🏗️ Technical Architecture

### Document Model System
Built on Powerhouse's document model architecture:
- **Document Models**: Schema definitions for transaction data
- **Operations**: CRUD operations for transaction management
- **Reducers**: Pure functions handling state transitions
- **Hooks**: React hooks for document state management

### Key Components
- **Editor**: Main application interface
- **CSV Uploader**: Transaction data import functionality
- **Analytics Engine**: Real-time calculation and visualization
- **Balance Timeline**: Interactive chart component with hover support

## 🧪 Development

### Available Scripts

```bash
# Development
npm run vetra          # Start development server
npm run tsc:watch     # TypeScript compilation in watch mode

# Building
npm run build         # Build for production
npm run tsc           # TypeScript compilation

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm test              # Run tests

# Generation
npm run generate      # Generate code from document models
```

### Project Structure

```
├── document-models/           # Powerhouse document models
│   └── crypto-transaction-analytics/
├── editors/                   # Application editors
│   └── crypto-transaction-analytics-editor/
├── subgraphs/                # GraphQL schema definitions
├── dist/                     # Built files
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🔒 Security

- **Environment Variables**: Sensitive addresses stored in `.env` (gitignored)
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Input Validation**: CSV data validation and sanitization
- **No Hardcoded Secrets**: All sensitive data configurable via environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:
1. Check the [Environment Configuration](#environment-configuration) section
2. Ensure your CSV format matches supported schemas
3. Verify Node.js and npm versions meet requirements
4. Open an issue with detailed error information

---

**Built with ❤️ using [Powerhouse](https://powerhouse.io) - The next-generation document engineering platform**