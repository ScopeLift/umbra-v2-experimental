import {
  formatJsonRpcError,
  formatJsonRpcResult
} from '@walletconnect/jsonrpc-utils';
import { getSdkError } from '@walletconnect/utils';
import type { Web3WalletTypes } from '@walletconnect/web3wallet';
import {
  type Account,
  hexToString,
  isAddress,
  type WalletClient,
  getAddress
} from 'viem';
import { sepolia } from 'viem/chains';

export const approveTransactionRequest = async ({
  request,
  stealthAddressAccount,
  walletClient
}: {
  request: Web3WalletTypes.SessionRequest;
  stealthAddressAccount: Account;
  walletClient: WalletClient;
}) => {
  if (!walletClient.account) {
    throw new Error('No account in approveTransactionRequest');
  }

  const { id, params } = request;
  const { request: rpcRequest } = params;

  try {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    let response: any;

    switch (rpcRequest.method) {
      case 'personal_sign':
      case 'eth_sign': {
        const message = getSignParamsMessage(rpcRequest.params);
        const signedMessage = await walletClient.signMessage({
          message,
          account: stealthAddressAccount
        });
        response = formatJsonRpcResult(id, signedMessage);
        break;
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4': {
        const { domain, types, message } = getSignTypedDataParamsData(
          rpcRequest.params
        );
        // biome-ignore lint/performance/noDelete: TODO figure out why necessary
        delete types.EIP712Domain;
        const signedData = await walletClient.signTypedData({
          domain,
          types,
          message,
          primaryType: '',
          account: walletClient.account
        });
        response = formatJsonRpcResult(id, signedData);
        break;
      }

      case 'eth_sendTransaction': {
        const sendTransaction = rpcRequest.params[0];
        const formattedTransaction = formatTransactionForViem(sendTransaction);

        try {
          const hash = await walletClient.sendTransaction({
            ...formattedTransaction,
            account: walletClient.account,
            chain: sepolia
          });
          response = formatJsonRpcResult(id, hash);
        } catch (error) {
          console.log('eth_sendTransaction', error);
        }
        break;
      }

      case 'eth_signTransaction': {
        const signTransaction = rpcRequest.params[0];
        const signature = await walletClient.signTransaction(signTransaction);
        response = formatJsonRpcResult(id, signature);
        break;
      }

      default:
        throw new Error(getSdkError('INVALID_METHOD').message);
    }

    return response;
  } catch (error) {
    return formatJsonRpcError(id, (error as Error).message);
  }
};

export const rejectTransactionRequest = (
  request: Web3WalletTypes.SessionRequest
) => {
  const { id } = request;
  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
};

/**
 * Gets message from various signing request methods by filtering out
 * a value that is not an address (thus is a message).
 * If it is a hex string, it gets converted to utf8 string.
 */
export function getSignParamsMessage(params: (string | `0x${string}`)[]) {
  const message = params.filter(p => !isAddress(p))[0];
  return typeof message === 'string' ? message : hexToString(message);
}

/**
 * Gets data from various signTypedData request methods by filtering out
 * a value that is not an address (thus is data).
 * If data is a string, convert it to an object.
 */
export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter(p => !isAddress(p))[0];
  if (typeof data === 'string') {
    return JSON.parse(data);
  }
  return data;
}

/**
 * Formats the transaction request caught by walletconnect to be sent by viem
 */
function formatTransactionForViem(transaction: {
  to: string;
  from: string;
  data: string;
  value: string;
}): {
  to: `0x${string}`;
  account: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
} {
  const formattedTransaction = {
    to: getAddress(transaction.to),
    account: getAddress(transaction.from),
    data: transaction.data as `0x${string}`,
    value: BigInt(transaction.value)
  };
  return formattedTransaction;
}
