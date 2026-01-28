import apiClient from './client';
import { ApiResponse } from './types';

export interface ExchangeRates {
    USDT_NGN: number;
    USDC_NGN: number;
    USD_NGN: number;
    BTC_USD_RATE: number;
    BTC_USD_DEDUCTION: number;
    BTC_USD: number;
    BTC_NGN: number;
    lastUpdated: string;
}

// Get exchange rates
export const getExchangeRates = async (): Promise<ExchangeRates> => {
    const response = await apiClient.get<ApiResponse<ExchangeRates>>('/settings/exchange-rates');
    return response.data.data;
};
