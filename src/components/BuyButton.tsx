import React from 'react';
import algo_dark from '../assets/algo_dark.svg';
import WalletConnectService from '../services/WalletService';
import { SButton, SButtonText } from './consts';

interface BuyButtonProps {
  price: number;
  address: string;
}

interface BuyButtonState {
  loading: boolean;
}

const algoStyleSmall = {
  height: '1rem',
  marginLeft: '0.2rem',
};

class BuyButton extends React.Component<BuyButtonProps, BuyButtonState> {
  constructor(props: BuyButtonProps) {
    super(props);
    this.state = { loading: false };
  }

  onClickBuy = async () => {
    console.log('hi');
    const account = this.props.address;
    if (!account) {
      new WalletConnectService().connector.createSession();
      return;
    }
    this.setState({ loading: true });
    try {
      // await TransactionClient.lotteryGameCall(account, this.props.game);
      // let tempState = this.state.thisPlayState.slice();
      // if (tempState.length === this.props.game['wagers']) {
      //   this.setState({
      //     thisPlayState: [this.props.address],
      //   });
      // } else {
      //   tempState.push(this.props.address);
      //   this.setState({
      //     thisPlayState: tempState,
      //   });
      // }
    } catch (error) {
      console.error(error);
    }
    this.setState({ loading: false });
  };
  render() {
    return (
      <SButton
        className='pointer-fade'
        onClick={this.onClickBuy}
        disabled={this.state.loading}
      >
        {this.state.loading ? (
          <span>Loading...</span>
        ) : (
          <SButtonText>
            {this.props.price}
            <img style={algoStyleSmall} src={algo_dark} alt='algos' />
          </SButtonText>
        )}
      </SButton>
    );
  }
}

export default BuyButton;
