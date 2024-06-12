import {
  EIP155,
  stripEip155Prefix,
  useWalletConnect
} from '@/contexts/walletconnect';
import AppAvatar from './app-avatar';
import { Card, CardTitle, CardDescription } from './ui/card';

interface WalletConnectSessionsProps {
  stealthAddress: string;
}

const WalletConnectSessions = ({
  stealthAddress
}: WalletConnectSessionsProps) => {
  const { sessions } = useWalletConnect();

  const filteredSessions = sessions.filter(session =>
    session.namespaces[EIP155].accounts.some(account =>
      account.includes(stealthAddress)
    )
  );

  if (filteredSessions.length === 0) {
    return (
      <div className="p-4 text-gray-700">
        No active WalletConnect sessions found for this stealth address.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <ul className="space-y-4">
        {filteredSessions.map(session => (
          <li key={session.topic}>
            <Card className="flex items-center p-4 shadow-none">
              <div className="flex gap-4 items-center">
                <AppAvatar imageSrc={session.peer.metadata.icons[0]} />
                <div className="flex flex-col gap-2">
                  <CardTitle>{session.peer.metadata.name}</CardTitle>
                  <CardDescription>{session.peer.metadata.url}</CardDescription>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalletConnectSessions;
