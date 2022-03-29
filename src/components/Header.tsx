import WalletConnect from '@walletconnect/client';
import { FunctionComponent } from 'react';
import styled from 'styled-components';
import logo from '../../src/logo.svg';
import { ellipseAddress } from '../utils';
import { SButton } from '../utils';

interface HeaderProps {
  address: string;
  connector: WalletConnect;
  killSession: () => {};
}

const SAddress = styled.span`
  font-weight: bold;
  color: aqua;
`;

const SLogo = styled.div`
  font-weight: bold;
  width: 50%;
`;

const Header: FunctionComponent<HeaderProps> = ({
  address,
  connector,
  killSession,
}: HeaderProps) => {
  const connectWallet = async () => connector.createSession();

  return (
    <div className='flex items-start justify-between mb5'>
      <SLogo className='flex items-center f4'>
        <img src={logo} className='app-logo mr2' alt='logo' />
        Mushroom Cloud NFT
      </SLogo>
      {address ? (
        <div className='flex flex-column tr'>
          <SAddress>{ellipseAddress(address)}</SAddress>
          <span className='pointer-fade' onClick={killSession}>
            Disconnect
          </span>
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
