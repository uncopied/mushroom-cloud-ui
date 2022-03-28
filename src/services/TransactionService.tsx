import algosdk, { LogicSigAccount } from 'algosdk';
import { ARTIST_SOUND_ADDRESS } from '../utils';
import ChainService from './ChainService';
import WalletService from './WalletService';

export default class TransactionService {
  algod = new ChainService().algod;
  walletService = new WalletService();

  sendAndConfirm = async (signedTxns: Uint8Array[]) => {
    try {
      const sentTxns = await this.algod.sendRawTransaction(signedTxns).do();
      console.log('sentTxns', sentTxns);
      const confirmedTxns = await algosdk.waitForConfirmation(
        this.algod,
        sentTxns.txId,
        4
      );
      console.log('success', confirmedTxns);
      return confirmedTxns;
    } catch (error) {
      throw error;
    }
  };

  sellAsset = async ({ sellerAccount, assetIndex, contractResult }: any) => {
    try {
      const contractEncoded = new Uint8Array(
        Buffer.from(contractResult, 'base64')
      );
      const contractSig = new LogicSigAccount(contractEncoded);
      const suggestedParams = await this.algod.getTransactionParams().do();
      // fund escrow
      const txn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sellerAccount,
        to: contractSig.address(),
        amount: 0.5 * 1e6,
        suggestedParams,
      });
      // opt in escrow
      const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: contractSig.address(),
        to: contractSig.address(),
        amount: 0,
        assetIndex,
        suggestedParams,
      });
      // transfer asset to escrow
      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sellerAccount,
        to: contractSig.address(),
        assetIndex,
        amount: 1,
        suggestedParams,
      });

      const group = algosdk.assignGroupID([txn0, txn1, txn2]);
      console.log('group', group);

      const signedTxns = await this.walletService.sign(group);
      console.log('signedTxns', signedTxns);

      signedTxns[1] = algosdk.signLogicSigTransactionObject(
        group[1],
        contractSig
      ).blob;

      const confirmedTxns = await this.sendAndConfirm(signedTxns);
      console.log('confirmedTxns', confirmedTxns);
      return confirmedTxns;
    } catch (error) {
      throw error;
    }
  };

  buyAsset = async ({
    buyerAccount,
    sellerAccount,
    assetIndex,
    price,
    contractSig,
  }: any) => {
    try {
      const params = await this.algod.getTransactionParams().do();
      // pay artist
      const txn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyerAccount,
        to: sellerAccount,
        amount: price * 1e6 * 0.9,
        suggestedParams: params,
      });
      // opt in buyer
      const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: buyerAccount,
        to: buyerAccount,
        amount: 0,
        assetIndex,
        suggestedParams: params,
      });
      // transfer asset to buyer
      const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: contractSig.address(),
        to: buyerAccount,
        amount: 1,
        assetIndex,
        closeRemainderTo: buyerAccount,
        suggestedParams: params,
      });
      // close remainder to seller
      const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: contractSig.address(),
        to: sellerAccount,
        amount: 0,
        closeRemainderTo: sellerAccount,
        suggestedParams: params,
      });
      // pay secondary artist
      const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyerAccount,
        to: ARTIST_SOUND_ADDRESS,
        amount: price * 1e6 * 0.1,
        suggestedParams: params,
      });
      const group = algosdk.assignGroupID([txn0, txn1, txn2, txn3, txn4]);
      const signedTxns = await this.walletService.sign(group);

      signedTxns[1] = algosdk.signLogicSigTransactionObject(
        group[1],
        contractSig
      ).blob;
      signedTxns[2] = algosdk.signLogicSigTransactionObject(
        group[2],
        contractSig
      ).blob;

      console.log('signedTxns', signedTxns);
      const confirmedTxs = await this.sendAndConfirm(signedTxns);
      return confirmedTxs;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
