const CURRENCY_CONFIG = {
    USD: {
        locale: "en-US",
        rate: 1,
    },
    EUR: {
        locale: "en-US",
        rate: 0.92,
    },
    GBP: {
        locale: "en-GB",
        rate: 0.79,
    },
    CAD: {
        locale: "en-CA",
        rate: 1.36,
    },
};

const DEFAULT_CURRENCY = "USD";

export function normalizeCurrency(currency) {
    return CURRENCY_CONFIG[currency] ? currency : DEFAULT_CURRENCY;
}

export function getCurrencySymbol(currency) {
    return (
        new Intl.NumberFormat(CURRENCY_CONFIG[normalizeCurrency(currency)].locale, {
            style: "currency",
            currency: normalizeCurrency(currency),
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
            .formatToParts(1)
            .find((part) => part.type === "currency")?.value || "$"
    );
}

export function convertCurrency(value, currency = DEFAULT_CURRENCY) {
    const amount = Number(value) || 0;
    const normalizedCurrency = normalizeCurrency(currency);
    return amount * CURRENCY_CONFIG[normalizedCurrency].rate;
}

export function formatCurrency(
    value,
    currency = DEFAULT_CURRENCY,
    { minimumFractionDigits = 2, maximumFractionDigits = 2 } = {},
) {
    const normalizedCurrency = normalizeCurrency(currency);
    const convertedValue = convertCurrency(value, normalizedCurrency);

    return new Intl.NumberFormat(CURRENCY_CONFIG[normalizedCurrency].locale, {
        style: "currency",
        currency: normalizedCurrency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(convertedValue);
}

export function formatSignedCurrency(value, currency = DEFAULT_CURRENCY, options = {}) {
    const amount = convertCurrency(value, currency);
    const sign = amount >= 0 ? "+" : "-";

    return `${sign}${formatCurrency(Math.abs(amount), currency, options)}`;
}
