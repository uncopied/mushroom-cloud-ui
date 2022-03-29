import algosdk from 'algosdk';
import {
  ALGOD_HOST_MAIN,
  ALGOD_HOST_TEST,
  INDEXER_HOST_MAIN,
  INDEXER_HOST_TEST,
  IS_MAIN_NET
} from '../utils';

export default class ChainService {
  isMainNet = IS_MAIN_NET;
  algodHost = this.isMainNet ? ALGOD_HOST_MAIN : ALGOD_HOST_TEST;
  algod = new algosdk.Algodv2('', this.algodHost, '');
  indexerHost = this.isMainNet ? INDEXER_HOST_MAIN : INDEXER_HOST_TEST;
  indexer = new algosdk.Indexer('', this.indexerHost, '');
}
