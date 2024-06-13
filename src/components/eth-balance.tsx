import { useBalance } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import { Avatar, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useEffect } from 'react';

interface EthBalanceProps {
  address: Address;
  isLoading: boolean;
  shouldRefetch: boolean;
}

const ETH_LOGO =
  'https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0000000000000000000000000000000000000000.png';

const EthBalance = ({ address, isLoading, shouldRefetch }: EthBalanceProps) => {
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch
  } = useBalance({
    address
  });

  const _isLoading = isLoadingBalance || isLoading;

  const formatted = balance?.value
    ? formatUnits(balance?.value, balance?.decimals)
    : '0.00';

  useEffect(() => {
    (async () => {
      if (shouldRefetch) {
        refetch();
      }
    })();
  }, [shouldRefetch, refetch]);

  return (
    <div className="p-2 bg-gray-300 flex gap-1 rounded-xl">
      <Avatar className="rounded-full border-[1px] border-gray-300 h-6 w-6">
        <AvatarImage src={ETH_LOGO} />
      </Avatar>
      <div className="text-sm uppercase my-auto">
        <span>
          {_isLoading ? (
            <div className="flex gap-1 items-center">
              <Skeleton className="w-8 h-4 bg-gray-200" />
              ETH
            </div>
          ) : (
            `${formatted} ETH`
          )}
        </span>
      </div>
    </div>
  );
};

export default EthBalance;
