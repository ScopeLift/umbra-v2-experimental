import type { SessionTypes } from '@walletconnect/types';
import { EIP155, stripEip155Prefix } from '@/contexts/walletconnect';
import AppAvatar from './app-avatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './ui/card';

interface WalletConnectSessionsProps {
  sessions: SessionTypes.Struct[];
}

const WalletConnectSessions = ({ sessions }: WalletConnectSessionsProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">
        WalletConnect Connections
      </h2>
      <ul className="space-y-4">
        {sessions.map(session => (
          <li key={session.topic}>
            <Card className="flex items-center p-4">
              <div className="flex gap-4 items-center">
                <AppAvatar imageSrc={session.peer.metadata.icons[0]} />
                <div className="flex flex-col gap-2">
                  <CardTitle>{session.peer.metadata.name}</CardTitle>
                  <CardDescription>{session.peer.metadata.url}</CardDescription>
                  <div className="">
                    <div className="text-sm text-gray-500">Account</div>
                    <code>
                      {stripEip155Prefix(
                        session.namespaces[EIP155].accounts[0]
                      )}
                    </code>
                  </div>
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
