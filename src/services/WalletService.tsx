import { formatJsonRpcRequest } from '@json-rpc-tools/utils';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from 'algorand-walletconnect-qrcode-modal';
import algosdk from 'algosdk';
import { BRIDGE } from '../utils';

// export const connector = new WalletConnect({
//   bridge: BRIDGE,
//   qrcodeModal: QRCodeModal,
// });

// export const sign = async (txns: any) => {
//   const txnsToSign = txns.map((txn: any) => {
//     const encodedTxn = Buffer.from(
//       algosdk.encodeUnsignedTransaction(txn)
//     ).toString('base64');
//     let result: any = {
//       txn: encodedTxn,
//     };
//     if (connector.accounts.includes(txn.from)) {
//       result.signers = [];
//     }
//     return result;
//   });

//   const request = formatJsonRpcRequest('algo_signTxn', [txnsToSign]);
//   const response = await connector.sendCustomRequest(request);
//   const signedTxns = response.map((element: any) => {
//     return element ? new Uint8Array(Buffer.from(element, 'base64')) : null;
//   });

//   return signedTxns;
// };

export default class WalletConnectService {
  connector = new WalletConnect({
    bridge: BRIDGE,
    qrcodeModal: QRCodeModal,
  });

  sign = async (txns: any) => {
    const txnsToSign = txns.map((txn: any) => {
      const encodedTxn = Buffer.from(
        algosdk.encodeUnsignedTransaction(txn)
      ).toString('base64');
      let result: any = {
        txn: encodedTxn,
      };
      if (this.connector.accounts.includes(txn.from)) {
        result.signers = [];
      }
      return result;
    });

    const request = formatJsonRpcRequest('algo_signTxn', [txnsToSign]);
    const response = await this.connector.sendCustomRequest(request);
    const signedTxns = response.map((element: any) => {
      return element ? new Uint8Array(Buffer.from(element, 'base64')) : null;
    });

    return signedTxns;
  };
}
