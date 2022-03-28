import WalletConnect from '@walletconnect/client';
import { IInternalEvent } from '@walletconnect/types';
import { LogicSigAccount } from 'algosdk';
import React from 'react';
import styled from 'styled-components';
import './App.css';
import BuyButton from './components/BuyButton';
import Header from './components/Header';
import Logo from './components/Logo';
import ContractService from './services/ContractService';
import TransactionService from './services/TransactionService';
import WalletService from './services/WalletService';
import {
  ARTIST_MAIN_ADDRESS,
  ASSET_INDEX,
  Chain,
  CONTRACT_RESULT,
  PRICE,
} from './utils';

interface AppProps {}

interface AppState {
  connector: WalletConnect;
  fetching: boolean;
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
  contractResult: any;
  // assets: IAssetData[];
}
const INITIAL_STATE: AppState = {
  connector: new WalletService().connector,
  fetching: false,
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
  contractResult: null,
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
    const { connector } = INITIAL_STATE;
    const { connected, accounts } = connector;
    this.state = {
      ...INITIAL_STATE,
      connected,
      accounts,
      address: accounts[0],
    };
    this.subscribeToWalletEvents();
  }

  contractService = new ContractService();
  transactionService = new TransactionService();

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

  putOnSale = async () => {
    const sellerAccount = ARTIST_MAIN_ADDRESS;
    const assetIndex = ASSET_INDEX;
    const price = PRICE;
    if (sellerAccount && assetIndex && price) {
      this.setState({ fetching: true });
      try {
        const contractResult =
          await this.contractService.generateAssetSaleContract(
            sellerAccount,
            assetIndex,
            price
          );

        const confirmedTxn = await this.transactionService.sellAsset({
          sellerAccount,
          assetIndex,
          contractResult,
        });

        this.setState({ contractResult });
        console.log(confirmedTxn);
      } catch (error) {
        throw error;
      }
      this.setState({ fetching: false });
    }
  };

  buyAsset = async () => {
    if (!this.state.address) {
      this.state.connector.createSession();
      return;
    }
    const contract = new Uint8Array(Buffer.from(CONTRACT_RESULT, 'base64'));
    const contractSig = new LogicSigAccount(contract);
    const buyerAccount = this.state.address;
    const sellerAccount = ARTIST_MAIN_ADDRESS;
    const assetIndex = ASSET_INDEX;
    const price = PRICE;

    if (buyerAccount && sellerAccount && contractSig && assetIndex && price) {
      this.setState({ fetching: true });
      try {
        const confirmedTxn = await this.transactionService.buyAsset({
          buyerAccount,
          sellerAccount,
          assetIndex,
          price,
          contractSig,
        });
        console.log(confirmedTxn);
        this.setState({
          contractResult: null,
        });
      } catch (error) {
        throw error;
      }
      this.setState({ fetching: false });
    }
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
            <BuyButton
              price={PRICE}
              buyAsset={this.buyAsset}
              putOnSale={this.putOnSale}
            ></BuyButton>
          </div>
        </SBody>
      </div>
    );
  }
}

export default App;
