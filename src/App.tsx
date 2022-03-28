import WalletConnect from '@walletconnect/client';
import { IInternalEvent } from '@walletconnect/types';
import React from 'react';
import styled from 'styled-components';
import './App.css';
import BuyButton from './components/BuyButton';
import Header from './components/Header';
import Logo from './components/Logo';
import WalletService from './services/WalletService';
import { Chain } from './utils';

interface AppProps {}

interface AppState {
  connector: WalletConnect | null;
  // fetching: boolean;
  connected: boolean;
  // showModal: boolean;
  // pendingRequest: boolean;
  // signedTxns: Uint8Array[][] | null;
  // pendingSubmissions: Array<number | Error>;
  // uri: string;
  accounts: string[];
  address: string;
  // result: IResult | null;
  chain: Chain;
  // assets: IAssetData[];
}
const INITIAL_STATE: AppState = {
  connector: null,
  // fetching: false,
  connected: false,
  // showModal: false,
  // pendingRequest: false,
  // signedTxns: null,
  // pendingSubmissions: [],
  // uri: "",
  accounts: [],
  address: '',
  // result: null,
  chain: Chain.TestNet,
  // assets: [],
};

const SBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    const connector = new WalletService().connector;
    const { connected, accounts } = connector;
    this.state = {
      ...INITIAL_STATE,
      connector,
      connected,
      accounts,
      address: accounts[0],
    };
    this.subscribeToWalletEvents();
  }

  subscribeToWalletEvents = () => {
    const connector = this.state.connector;
    if (!connector) return;

    connector.on('connect', (error: Error | null, payload: any) => {
      console.log(`connector.on("connect")`);
      if (error) throw error;
      this.onConnect(payload);
    });

    connector.on(
      'session_update',
      async (error: Error | null, payload: any) => {
        console.log(`connector.on("session_update")`);
        if (error) throw error;
        const accounts = payload.params[0].accounts;
        this.onSessionUpdate(accounts);
      }
    );

    connector.on('disconnect', (error: Error | null, payload: any) => {
      console.log(`connector.on("disconnect")`);
      if (error) throw error;
      this.onDisconnect();
    });

    if (connector.connected) {
      const { accounts } = connector;
      this.setState({
        connected: true,
        accounts,
        address: accounts[0],
      });
      this.onSessionUpdate(accounts);
    }
    this.setState({ connector });
  };

  onConnect = async (payload: IInternalEvent) => {
    const { accounts } = payload.params[0];
    await this.setState({
      connected: true,
      accounts,
      address: accounts[0],
    });
    // await this.getAccountAssets();
  };

  onSessionUpdate = async (accounts: string[]) => {
    await this.setState({ accounts, address: accounts[0] });
    // await this.getAccountAssets();
  };

  onDisconnect = async () => {
    await this.setState({ ...INITIAL_STATE });
  };

  // getAccountAssets = async () => {
  //   const { address, chain } = this.state;
  //   this.setState({ fetching: true });
  //   try {
  //     // get account balances
  //     const assets = await apiGetAccountAssets(chain, address);
  //     await this.setState({ fetching: false, address, assets });
  //   } catch (error) {
  //     console.error(error);
  //     await this.setState({ fetching: false });
  //   }
  // };

  killSession = async () => {
    const { connector } = this.state;
    if (connector) connector.killSession();
    await this.setState({ ...INITIAL_STATE });
  };

  render() {
    return (
      <div>
        <Header
          address={this.state.address}
          connector={this.state.connector}
          killSession={this.killSession}
        ></Header>
        <SBody>
          <Logo></Logo>
          <div style={{ marginTop: '1rem' }}>
            <BuyButton address={this.state.address} price={100}></BuyButton>
          </div>
        </SBody>
      </div>
    );
  }
}

export default App;
