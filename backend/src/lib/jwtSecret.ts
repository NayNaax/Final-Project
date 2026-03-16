const developmentJwtSecret = "firstfund-local-dev-secret";

export const getJwtSecret = () => {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }

    if (process.env.NODE_ENV !== "production") {
        return developmentJwtSecret;
    }

    return undefined;
};
