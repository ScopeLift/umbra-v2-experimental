import { type NextRequest, NextResponse } from 'next/server';
import { createWalletClient, parseEther, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { waitForTransactionReceipt } from 'viem/actions';

export interface BatchFundRequest {
  to: Address;
  formattedValue: string;
}

export interface BatchFundResponse {
  hashes: `0x${string}`[];
}

export interface ErrorResponse {
  error: string;
}

export async function POST(req: NextRequest) {
  const reqs = (await req.json()) as BatchFundRequest[];

  const privateKey = process.env.FUNDING_ACCOUNT_PRIVATE_KEY as
    | `0x${string}`
    | undefined;

  if (!privateKey) {
    const errorResponse: ErrorResponse = {
      error: 'Funding account private key not found'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }

  try {
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(process.env.SEPOLIA_RPC_URL as string | undefined)
    });

    const hashes: `0x${string}`[] = [];

    for (const req of reqs) {
      const hash = await walletClient.sendTransaction({
        account: walletClient.account,
        chain: sepolia,
        to: req.to,
        value: parseEther(req.formattedValue)
      });

      hashes.push(hash);
    }

    await Promise.all(
      hashes.map(hash => waitForTransactionReceipt(walletClient, { hash }))
    );

    const response: BatchFundResponse = { hashes };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending ETH:', error);
    const errorResponse: ErrorResponse = {
      error: 'Error sending ETH'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
