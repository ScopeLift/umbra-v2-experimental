import type { SessionTypes } from '@walletconnect/types';
import { EIP155, stripEip155Prefix } from '@/contexts/walletconnect';
import AppAvatar from './app-avatar';

interface WalletConnectSessionsProps {
  sessions: SessionTypes.Struct[];
}

const WalletConnectSessions = ({ sessions }: WalletConnectSessionsProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">WalletConnect Connections</h2>
      <ul className="space-y-4">
        {sessions.map(session => (
          <li
            key={session.topic}
            className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm"
          >
            <AppAvatar imageSrc={session.peer.metadata.icons[0]} />
            <div>
              <div className="font-semibold">
                App Name: {session.peer.metadata.name}
              </div>
              <div className="text-sm text-gray-600">
                Url: {session.peer.metadata.url}
              </div>
              <div className="text-sm text-gray-600">
                Account:{' '}
                {stripEip155Prefix(session.namespaces[EIP155].accounts[0])}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WalletConnectSessions;
