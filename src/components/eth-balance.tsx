import { useBalance } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import { Avatar, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';

interface EthBalanceProps {
  address: Address;
}

const ETH_LOGO =
  'https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0000000000000000000000000000000000000000.png';

const EthBalance = ({ address }: EthBalanceProps) => {
  const { data: balance, isLoading } = useBalance({
    address
  });

  const formatted = balance?.value
    ? formatUnits(balance?.value, balance?.decimals)
    : '0';

  return (
    <div className="p-2 bg-gray-300 flex gap-1 rounded-xl">
      <Avatar className="rounded-full border-[1px] border-gray-300 h-6 w-6">
        <AvatarImage src={ETH_LOGO} />
      </Avatar>
      <div className="text-sm uppercase my-auto">
        {isLoading ? <Skeleton /> : `${formatted} ETH`}
      </div>
    </div>
  );
};

export default EthBalance;
