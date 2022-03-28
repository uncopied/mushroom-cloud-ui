import WalletConnect from '@walletconnect/client';
import { FunctionComponent } from 'react';
import styled from 'styled-components';
import { ellipseAddress } from '../utils';
import { SButton, SLink } from './consts';

interface HeaderProps {
  address: string;
  connector: WalletConnect | null;
  killSession: () => {};
}

const SAddress = styled.span`
  font-weight: bold;
  color: aqua;
`;

const Header: FunctionComponent<HeaderProps> = ({
  address,
  connector,
  killSession,
}: HeaderProps) => {
  const connectWallet = async () => connector?.createSession();

  return (
    <div className='tr'>
      {address ? (
        <div className='flex flex-column'>
          <SAddress>{ellipseAddress(address)}</SAddress>
          <SLink className='pointer-fade' onClick={killSession}>
            Disconnect
          </SLink>
        </div>
      ) : (
        <SButton className='pointer-fade' onClick={connectWallet}>
          Connect Wallet
        </SButton>
      )}
    </div>
  );
};

export default Header;
