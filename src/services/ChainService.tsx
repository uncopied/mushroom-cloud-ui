import algosdk from 'algosdk';
import { ALGOD_HOST_MAIN, ALGOD_HOST_TEST, Chain } from '../utils';
// import { IAssetData } from './types';

const mainNetClient = new algosdk.Algodv2('', ALGOD_HOST_MAIN, '');
const testNetClient = new algosdk.Algodv2('', ALGOD_HOST_TEST, '');

function clientForChain(chain: Chain): algosdk.Algodv2 {
  switch (chain) {
    case Chain.MainNet:
      return mainNetClient;
    case Chain.TestNet:
      return testNetClient;
    default:
      throw new Error(`unknown chain type: ${chain}`);
  }
}

export async function apiGetAccountAssets(
  chain: Chain,
  address: string
): Promise<any[]> {
  const client = clientForChain(chain);

  const accountInfo = await client
    .accountInformation(address)
    .setIntDecoding(algosdk.IntDecoding.BIGINT)
    .do();

  const algoBalance = accountInfo.amount as bigint;
  const assetsFromRes: Array<{
    'asset-id': bigint;
    amount: bigint;
    creator: string;
    frozen: boolean;
  }> = accountInfo.assets;

  const assets: any[] = assetsFromRes.map(
    ({ 'asset-id': id, amount, creator, frozen }) => ({
      id: Number(id),
      amount,
      creator,
      frozen,
      decimals: 0,
    })
  );

  assets.sort((a, b) => a.id - b.id);

  await Promise.all(
    assets.map(async (asset) => {
      const { params } = await client.getAssetByID(asset.id).do();
      asset.name = params.name;
      asset.unitName = params['unit-name'];
      asset.url = params.url;
      asset.decimals = params.decimals;
    })
  );

  assets.unshift({
    id: 0,
    amount: algoBalance,
    creator: '',
    frozen: false,
    decimals: 6,
    name: 'Algo',
    unitName: 'Algo',
  });

  return assets;
}

export async function apiGetTxnParams(
  chain: Chain
): Promise<algosdk.SuggestedParams> {
  const params = await clientForChain(chain).getTransactionParams().do();
  return params;
}

export async function apiSubmitTransactions(
  chain: Chain,
  stxns: Uint8Array[]
): Promise<number> {
  const { txnId } = await clientForChain(chain).sendRawTransaction(stxns).do();
  return await waitForTransaction(chain, txnId);
}

async function waitForTransaction(
  chain: Chain,
  txnId: string
): Promise<number> {
  const client = clientForChain(chain);

  let lastStatus = await client.status().do();
  let lastRound = lastStatus['last-round'];
  while (true) {
    const status = await client.pendingTransactionInformation(txnId).do();
    if (status['pool-error']) {
      throw new Error(`Transaction Pool Error: ${status['pool-error']}`);
    }
    if (status['confirmed-round']) {
      return status['confirmed-round'];
    }
    lastStatus = await client.statusAfterBlock(lastRound + 1).do();
    lastRound = lastStatus['last-round'];
  }
}
