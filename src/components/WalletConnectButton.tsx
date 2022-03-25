import { FunctionComponent } from 'react';
import styled from 'styled-components';
import WalletConnectService from '../services/WalletConnectService';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import WalletConnect from '@walletconnect/client';

interface WalletConnectButtonProps {}

const ConnectButton = styled.button`
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: none;
`;

// public walletConnectInit = async () => {
//   // bridge url
//   const bridge = "https://bridge.walletconnect.org";

//   // create new connector
//   const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

//   await this.setState({ connector });

//   // check if already connected
//   if (!connector.connected) {
//     // create new session
//     await connector.createSession();
//   }

//   // subscribe to events
//   await this.subscribeToEvents();
// };

const WalletConnectButton: FunctionComponent<WalletConnectButtonProps> = () => {
  const connectWallet = async () => {
    // const account = this.props.currentAccount;
    // if (account) {
    //   this.props.navigate("/account/" + account);
    //   this.setState(this.initState);
    // } else if (!WalletClient.connection.connected) {
    //   WalletClient.connection.createSession();
    // }
    WalletConnectService.connector.createSession();
  };

  return (
    <ConnectButton onClick={connectWallet}>Connect to Wallet</ConnectButton>
  );
};

export default WalletConnectButton;
