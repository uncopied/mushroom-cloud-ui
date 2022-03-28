import algosdk, { LogicSigAccount } from 'algosdk';
import { ARTIST_SOUND_ADDRESS } from '../utils';
import ChainService from './ChainService';
import WalletService from './WalletService';
// import WalletService from './WalletService';
// import ChainClient from "./chain";
// import WalletService from "./wallet";
// import toast from "react-hot-toast";
// import Constants from "./constants";

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
        // to: Constants.houseAddress,
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

  //   export const cancelSellAsset = async ({
  //     sellerAccount,
  //     assetIndex,
  //     contractSig,
  //   }) => {
  //     const toastId = toast.loading(Constants.loadingMessage);
  //     try {
  //       const params = await this.algod.getTransactionParams().do();
  //       // opt in seller
  //       const tx0 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  //         from: sellerAccount,
  //         to: sellerAccount,
  //         amount: 0,
  //         assetIndex,
  //         suggestedParams: params,
  //       });
  //       // close asset to seller
  //       const tx1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  //         from: contractSig.address(),
  //         to: sellerAccount,
  //         assetIndex,
  //         amount: 1,
  //         closeRemainderTo: sellerAccount,
  //         suggestedParams: params,
  //       });
  //       // close remainder to seller
  //       const tx2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  //         from: contractSig.address(),
  //         to: sellerAccount,
  //         amount: 0,
  //         closeRemainderTo: sellerAccount,
  //         suggestedParams: params,
  //       });
  //       const group = algosdk.assignGroupID([tx0, tx1, tx2]);
  //       const signedTxns = await sign(group);
  //       signedTxns[1] = algosdk.signLogicSigTransactionObject(
  //         group[1],
  //         contractSig
  //       ).blob;
  //       signedTxns[2] = algosdk.signLogicSigTransactionObject(
  //         group[2],
  //         contractSig
  //       ).blob;
  //       const confirmedTxs = await sendAndConfirm({
  //         signedTxns,
  //         toastId,
  //       });
  //       toast.success('This asset has been transferred back to your account.', {
  //         id: toastId,
  //       });
  //       return confirmedTxs;
  //     } catch (error) {
  //       toast.error(Constants.errorMessage, { id: toastId });
  //       throw error;
  //     }
  //   };

  //   export const optIn = async (account, assetIndex) => {
  //     const toastId = toast.loading(Constants.loadingMessage);
  //     try {
  //       const params = await this.algod.getTransactionParams().do();
  //       const tx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  //         from: account,
  //         to: account,
  //         amount: 0,
  //         assetIndex,
  //         suggestedParams: params,
  //       });
  //       const group = [tx];
  //       const signedTxns = await sign(group);
  //       const confirmedTxs = await sendAndConfirm({
  //         signedTxns,
  //         toastId,
  //       });
  //       toast.success(`Asset opt-in successful.`, { id: toastId });
  //       return confirmedTxs;
  //     } catch (error) {
  //       toast.error(Constants.errorMessage, { id: toastId });
  //       throw error;
  //     }
  //   };

  //   export const optOutAsset = async (account, assetIndices) => {
  //     const toastId = toast.loading(Constants.loadingMessage);
  //     try {
  //       const params = await this.algod.getTransactionParams().do();
  //       const group = assetIndices.map((index) => {
  //         return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  //           from: account,
  //           to: account,
  //           amount: 0,
  //           assetIndex: index,
  //           suggestedParams: params,
  //           closeRemainderTo: account,
  //         });
  //       });
  //       const signedTxns = await sign(group);
  //       toast.loading(Constants.sendingMessage, { id: toastId });
  //       const sentTxns = signedTxns.map(
  //         async (tx) => await this.algod.sendRawTransaction(tx).do()
  //       );
  //       toast.success(`Opt out successful.`, { id: toastId });
  //       return sentTxns;
  //     } catch (error) {
  //       console.log(error.message);
  //       toast.error(Constants.errorMessage, { id: toastId });
  //       throw error;
  //     }
  //   };

  //   export const optOutApp = async (account, appIndex) => {
  //     const toastId = toast.loading(Constants.loadingMessage);
  //     try {
  //       const params = await this.algod.getTransactionParams().do();
  //       const tx = algosdk.makeApplicationClearStateTxnFromObject({
  //         appIndex: appIndex,
  //         suggestedParams: params,
  //         from: account,
  //       });
  //       const group = [tx];
  //       const signedTxns = await sign(group);
  //       const confirmedTxs = await sendAndConfirm({
  //         signedTxns,
  //         toastId,
  //       });
  //       toast.success(`Opt out successful.`, { id: toastId });
  //       return confirmedTxs;
  //     } catch (error) {
  //       toast.error(Constants.errorMessage, { id: toastId });
  //       throw error;
  //     }
  //   };

  //   export const lotteryGameCall = async (account: any, game: any) => {
  //     // const toastId = toast.loading(Constants.loadingMessage);
  //     try {
  //       const params = await this.algod.getTransactionParams().do();
  //       const appReponse = await ChainClient.indexer
  //         .lookupApplications(game['app_index'])
  //         .do();
  //       let accounts = appReponse['application']['params']['global-state']
  //         ? appReponse['application']['params']['global-state']
  //             .map((item) => item['value']['bytes'])
  //             .map((item) => new Uint8Array(Buffer.from(item, 'base64')))
  //             .map((item) => algosdk.encodeAddress(item))
  //         : [];
  //       const tx0 = algosdk.makeApplicationNoOpTxnFromObject({
  //         from: account,
  //         appIndex: game['app_index'],
  //         suggestedParams: params,
  //         accounts: accounts,
  //       });
  //       const tx1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  //         from: account,
  //         to: algosdk.getApplicationAddress(game['app_index']),
  //         amount: game['stake'] * 1e6,
  //         suggestedParams: params,
  //       });
  //       const group = algosdk.assignGroupID([tx0, tx1]);
  //       const signedTxns = await sign(group);
  //       const confirmedTxs = await sendAndConfirm({
  //         signedTxns,
  //         toastId,
  //       });
  //       //   toast.success(`App call successful.`, { id: toastId });
  //       return confirmedTxs;
  //     } catch (error) {
  //       //   toast.error(Constants.errorMessage, { id: toastId });
  //       throw error;
  //     }
  //   };

  //   export const betGameCall = async (account, game, newWager) => {
  //     const toastId = toast.loading(Constants.loadingMessage);
  //     try {
  //       const params = await this.algod.getTransactionParams().do();
  //       const appReponse = await ChainClient.indexer
  //         .lookupApplications(game['app_index'])
  //         .do();
  //       let accounts = appReponse['application']['params']['global-state']
  //         ? appReponse['application']['params']['global-state']
  //             .map((item) => item['value']['bytes'])
  //             .map((item) => new Uint8Array(Buffer.from(item, 'base64')))
  //             .map((item) => algosdk.encodeAddress(item))
  //         : [];
  //       const currentWager = appReponse['application']['params'][
  //         'global-state'
  //       ].find((item) => item['value']['type'] == 2)['value']['uint'];
  //       const tx0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  //         from: account,
  //         to: algosdk.getApplicationAddress(game['app_index']),
  //         amount: newWager ? newWager : currentWager,
  //         suggestedParams: params,
  //       });
  //       const tx1 = algosdk.makeApplicationNoOpTxnFromObject({
  //         from: account,
  //         appIndex: game['app_index'],
  //         suggestedParams: params,
  //         accounts: accounts,
  //       });
  //       const group = algosdk.assignGroupID([tx0, tx1]);
  //       const signedTxns = await sign(group);
  //       const confirmedTxs = await sendAndConfirm({
  //         signedTxns,
  //         toastId,
  //       });
  //       toast.success(`App call successful.`, { id: toastId });
  //       return confirmedTxs;
  //     } catch (error) {
  //       toast.error(Constants.errorMessage, { id: toastId });
  //       throw error;
  //     }
  //   };
}
