-- Enable fractional share quantities for positions and trades
ALTER TABLE "Position"
    ALTER COLUMN "shares" TYPE DOUBLE PRECISION
    USING "shares"::DOUBLE PRECISION;

ALTER TABLE "Trade"
    ALTER COLUMN "shares" TYPE DOUBLE PRECISION
    USING "shares"::DOUBLE PRECISION;
