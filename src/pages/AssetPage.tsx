import WalletConnect from '@walletconnect/client';
import { LogicSigAccount } from 'algosdk';
import React from 'react';
import { useParams } from 'react-router';
import BuyButton from '../components/BuyButton';
import SellButton from '../components/SellButton';
import ChainService from '../services/ChainService';
import ContractService from '../services/ContractService';
import TransactionService from '../services/TransactionService';
import {
  ARTIST_MAIN_ADDRESS,
  ASSET_INDEX,
  CONTRACT_RESULT,
  PRICE,
  SImage
} from '../utils';

interface AssetPageProps {
  connector: WalletConnect;
  address: string;
  assetIndex: number;
}

interface AssetPageState {
  fetching: boolean;
  contractResult: any;
  assetInfo: any;
}

class AssetPage extends React.Component<AssetPageProps, AssetPageState> {
  constructor(props: AssetPageProps) {
    super(props);
    this.state = {
      fetching: false,
      contractResult: null,
      assetInfo: null,
    };
  }

  contractService = new ContractService();
  transactionService = new TransactionService();
  chainService = new ChainService();

  componentDidMount() {
    console.log('asset component did mount');
    this.setAsset(this.props.assetIndex);
  }

  setAsset = async (index: number) => {
    this.setState({ fetching: true });
    this.chainService.indexer
      .lookupAssetByID(index)
      .do()
      .then((response) => {
        this.setState({ assetInfo: response.asset.params, fetching: false });
        console.log(this.state);
      })
      .catch((error: Error) => {
        console.error(error);
      });

    // this.chainService.indexer
    //   .lookupAssetBalances(index)
    //   .do()
    //   .then((response) => {
    //     console.log(response);
    //     // const owner = response['balances'].find((item) => item['amount'] > 0)[
    //     //   'address'
    //     // ];
    //     // this.setState({ owner: owner });
    //   });

    // FirebaseClient.getContractForAsset(index).then((response) => {
    //   this.setState({
    //     thisContract: response,
    //   });
    // });
    // FirebaseClient.getCollectionForAsset(index).then((response) => {
    //   this.setState({
    //     thisCollection: response,
    //   });
    // });
  };

  onSellAsset = async () => {
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
      } catch (error) {
        throw error;
      }
      this.setState({ fetching: false });
    }
  };

  onBuyAsset = async () => {
    if (!this.props.address) {
      this.props.connector.createSession();
      return;
    }
    const contract = new Uint8Array(Buffer.from(CONTRACT_RESULT, 'base64'));
    const contractSig = new LogicSigAccount(contract);
    const buyerAccount = this.props.address;
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
    console.log(this.state.assetInfo?.manager);
    const isOwner = this.state.assetInfo?.manager === this.props.address;

    return (
      <div>
        <SImage src={this.state.assetInfo?.url} alt='nft' />
        <div className='mt3'>
          {isOwner ? (
            <SellButton onSellAsset={this.onSellAsset} />
          ) : (
            <BuyButton price={PRICE} onBuyAsset={this.onBuyAsset} />
          )}
        </div>
      </div>
    );
  }
}

function AssetPageWithParams(props: any) {
  const params = useParams();
  return <AssetPage {...props} assetIndex={Number(params.index)} />;
}

export default AssetPageWithParams;
