import { useSettings } from "../context/SettingsContext";
import { convertCurrency, formatCurrency, formatSignedCurrency, getCurrencySymbol } from "../lib/currency";

export function useCurrency() {
    const { settings } = useSettings();
    const currency = settings.currency || "USD";

    return {
        currency,
        currencySymbol: getCurrencySymbol(currency),
        convertCurrency: (value) => convertCurrency(value, currency),
        formatCurrency: (value, options) => formatCurrency(value, currency, options),
        formatSignedCurrency: (value, options) => formatSignedCurrency(value, currency, options),
    };
}
