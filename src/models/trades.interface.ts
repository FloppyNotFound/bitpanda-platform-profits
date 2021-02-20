import { BestFeeCollection } from './best-fee-collection.interface';
import { BitpandaResponseData } from './bitpanda-response-data.interface';
import { BitpandaResponse } from './bitpanda-response.interface';
import { RelatedTradeAttributes } from './related-trade-attributes.interface';

export interface TradesResponse extends BitpandaResponse {
  data: TradeData[];
}

export interface TradeData extends BitpandaResponseData {
  attributes: TradeAttributes;
}

interface TradeAttributes extends RelatedTradeAttributes {
  best_fee_collection: BestFeeCollection;
}
