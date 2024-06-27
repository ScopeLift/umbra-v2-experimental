# Umbra V2 Prototype: Connecting Stealth Addresses to dApps via WalletConnect

## Overview

This prototype demonstrates a key feature of Umbra V2: the ability to connect stealth addresses to any decentralized application (dApp), in this case, using WalletConnect. By showcasing this functionality, the prototype illustrates how Umbra V2 enhances interoperability in the Ethereum ecosystem. To learn more about Umbra V2, please see the blog post [here](https://scopelift.co/blog/introducing-umbra-v2-architecture).

## Purpose

The primary objective of this prototype is to:

**Demonstrate seamless connection of stealth addresses to any dApp via WalletConnect**

This showcases how Umbra V2's stealth addresses can integrate with the broader Ethereum ecosystem, enabling interactions with existing dApps.

## Supporting Features

To facilitate the purpose, the prototype includes these supporting features:

1. Generation of stealth addresses (the prototype randomly generates 5 stealth addresses to mimic a user seeing their stealth addresses on the Umbra V2 interface)
2. Funding of stealth addresses (for demonstration purposes)
3. Display of ETH balance for stealth addresses (to show changes in balance after performing a transaction using the stealth address via the connected dApp)
4. Management of WalletConnect sessions for each stealth address
5. Handling approving/rejecting transaction requests made by a user from a connected dApp

## Technologies Used

- React
- Next.js
- Tailwind CSS
- Viem
- WalletConnect
- Wagmi
- ShadCN UI components

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/marcomariscal/umbra-v2-experimental-deploy.git
   cd umbra-v2-experimental-deploy
   ```

2. Install dependencies:

   Using npm:

   ```bash
   npm install
   ```

   Using Yarn:

   ```bash
   yarn install
   ```

   Using Bun:

   ```bash
   bun install
   ```

3. Set up environment variables. Create a `.env.local` file in the root directory and add:

   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_walletconnect_project_id>
   FUNDING_ACCOUNT_PRIVATE_KEY=<your_funding_account_private_key>
   SEPOLIA_RPC_URL=<your_rpc_url>
   ```

   The `FUNDING_ACCOUNT_PRIVATE_KEY` is used to fund the randomly generate stealth address upon loading the app. This can be any account that has enough ETH to fund those addresses.

4. Start the development server:

   Using npm:

   ```bash
   npm run dev
   ```

   Using Yarn:

   ```bash
   yarn dev
   ```

   Using Bun:

   ```bash
   bun run dev
   ```

## Usage

1. **Connect Wallet**: Use the "Connect" button to connect your Ethereum wallet.
2. **Generate Stealth Addresses**: Stealth addresses are generated automatically after wallet connection.
3. **Fund Stealth Addresses**: For ease-of-use and demonstration, the generated stealth addresses are funded with a small amount of ETH automatically.
4. **Connect to dApps**: Use the "Connect to Apps" button for each stealth address to open the WalletConnect modal and connect to any compatible dApp using the WallectConnect URI from the desired dApp.

## Key Components

- **StealthAddressManager**: Manages the generation and display of stealth addresses.
- **ConnectViaWalletConnect**: Handles the WalletConnect integration for connecting stealth addresses to dApps.
- **WalletConnectSessions**: Displays and manages active WalletConnect sessions for each stealth address.
- **TransactionModal**: Handles transaction requests: this modal opens upon receiving a WalletConnect session request (aka initiating a transaction on some connected dApp)

## Prototype Limitations

- This is a demonstration prototype and should not be used for real transactions or in production environments.
- The funding mechanism is simplified for demonstration purposes and does not reflect how the actual Umbra V2 protocol interface will work.
- The prototype uses the Sepolia testnet for all operations.

## Learn More

For more information about the Umbra V2 architecture and its features, please refer to the [official blog post](https://scopelift.co/blog/introducing-umbra-v2-architecture).

## Contributing

This prototype is for demonstration purposes. For questions or feedback about Umbra V2, please reach out to the Umbra team through their official channels.

## License

This project is available under the [MIT](/LICENSE) license.

Copyright (c) 2024 ScopeLift
