import { formatJsonRpcRequest } from '@json-rpc-tools/utils';
import WalletConnect from '@walletconnect/client';
import AlgorandModal from 'algorand-walletconnect-qrcode-modal';
import algosdk from 'algosdk';

export default class WalletConnectService {
  // static walletConnectInit = async () => {
  //   // bridge url
  //   const bridge = 'https://bridge.walletconnect.org';

  //   // create new connector
  //   const connector = new WalletConnect({ bridge, qrcodeModal: AlgorandModal });

  //   // await this.setState({ connector });

  //   // check if already connected
  //   if (!connector.connected) {
  //     // create new session
  //     await connector.createSession();
  //   }

  //   // subscribe to events
  //   // await this.subscribeToEvents();
  // };

  static connector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModal: AlgorandModal,
  });

  static sign = async (txs: any) => {
    const txsToSign = txs.map((txn: any) => {
      const encodedTxn = Buffer.from(
        algosdk.encodeUnsignedTransaction(txn)
      ).toString('base64');
      let result = {
        txn: encodedTxn,
      };
      if (WalletConnectService.connector.accounts.includes(txn.from)) {
        // result["signers"]: any[] = [];
      }
      return result;
    });

    const request = formatJsonRpcRequest('algo_signTxn', [txsToSign]);
    const response = await WalletConnectService.connector.sendCustomRequest(
      request
    );
    const signedTxs = response.map((element: any) => {
      return element ? new Uint8Array(Buffer.from(element, 'base64')) : null;
    });
    return signedTxs;
  };
}
