import { useChainId, useChains } from 'wagmi';

const useEtherscanTxUrl = (txHash: string) => {
  const chains = useChains();
  const chainId = useChainId();
  const chain = chains.find(c => c.id === chainId);

  const etherscanTxUrl = `${chain?.blockExplorers?.default.url}/tx/${txHash}`;

  return etherscanTxUrl;
};

export default useEtherscanTxUrl;
