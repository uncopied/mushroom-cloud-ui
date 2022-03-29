import WalletConnect from '@walletconnect/client';
import { IInternalEvent } from '@walletconnect/types';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import AssetPage from './pages/AssetPage';
import WalletService from './services/WalletService';

interface AppProps {}

interface AppState {
  connector: WalletConnect;
  fetching: boolean;
  connected: boolean;
  accounts: string[];
  address: string;
  // contractResult: any;
  // assets: IAssetData[];
}

const INITIAL_STATE: AppState = {
  connector: new WalletService().connector,
  fetching: false,
  connected: false,
  accounts: [],
  address: '',
  // contractResult: null,
  // assets: [],
};

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    const { connector } = INITIAL_STATE;
    const { connected, accounts } = connector;
    this.state = {
      ...INITIAL_STATE,
      connected,
      accounts,
      address: accounts[0],
    };
  }

  componentDidMount() {
    console.log('app component did mount');
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
        <BrowserRouter key={this.state.address}>
          <Routes>
            {/* <Route path='/' element={<Home />} /> */}
            <Route
              path='/asset/:index'
              element={
                <AssetPage
                  address={this.state.address}
                  connector={this.state.connector}
                />
              }
            />
            {/* <Route
              path='/asset/:index'
              element={<AssetPage address={this.state.address} />}
            /> */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
