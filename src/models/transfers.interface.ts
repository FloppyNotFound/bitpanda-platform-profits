import { BestFeeCollectionAttributes } from './best-fee-collection-attributes.interface';
import { BitpandaResponseData } from './bitpanda-response-data.interface';
import { BitpandaResponse } from './bitpanda-response.interface';
import { RelatedTradeAttributes } from './related-trade-attributes.interface';
import { RelatedTrade } from './related-trade.interface';
import { TransactionAttributes } from './transaction-attributes.interface';

export interface TransfersResponse extends BitpandaResponse {
  data: TransferData[];
}

export interface TransferData extends BitpandaResponseData {
  attributes: TransferAttributes;
}

interface TransferAttributes extends TransactionAttributes {
  best_fee_collection?: TransferBestFeeCollection<TransferBestFeeCollectionAttributes>;
  amount_eur_incl_fee?: string;
  purpose_text?: string;
  tx_id?: string;
}

interface TransferBestFeeCollectionAttributes {
  best_current_price_eur: string;
  best_used_price_eur: string;
  bfc_deduction: number;
  bfc_market_value_eur: string;
  related_trade: RelatedTrade<TransferRelatedTradeAttributes>;
}

interface TransferRelatedTradeAttributes extends RelatedTradeAttributes {
  related_swap_trade?: RelatedTrade<RelatedSwapTradeAttributes>;
}

interface RelatedSwapTradeAttributes extends RelatedTradeAttributes {
  related_swap_trade_id: string;
  best_fee_collection: TransferBestFeeCollection<BestFeeCollectionAttributes>;
}

interface TransferBestFeeCollection<T> {
  type: string;
  attributes: T;
}
