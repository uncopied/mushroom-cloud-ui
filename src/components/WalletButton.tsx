import React from 'react';
import styled from 'styled-components';
import WalletService from '../services/WalletService';

interface WalletButtonProps {
  address: string;
}

interface WalletButtonState {
  address: string;
}

const ConnectButton = styled.button`
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: none;
`;

class WalletButton extends React.Component<
  WalletButtonProps,
  WalletButtonState
> {
  constructor(props: WalletButtonProps) {
    super(props);
    this.state = {
      address: this.props.address,
    };
  }

  walletService = new WalletService();

  connectWallet = async () => {
    if (this.props.address) {
      await this.setState({ address: this.props.address });
      console.log('already connected to', this.state.address);
    } else {
      this.walletService.connector.createSession();
    }
  };

  render() {
    const buttonText = this.props.address
      ? `${this.props.address.slice(0, 11)}...`
      : 'Connect to Wallet';

    return (
      <ConnectButton onClick={this.connectWallet}>{buttonText}</ConnectButton>
    );
  }
}

export default WalletButton;
