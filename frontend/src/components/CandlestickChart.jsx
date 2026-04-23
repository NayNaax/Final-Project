import React, { useEffect, useRef, useState } from "react";

export function CandlestickChart({
    data,
    trendIsPositive,
    getLabel,
    className = "",
    containerStyle,
    emptyHeight = 400,
}) {
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(800);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        setHoveredIndex(null);
    }, [data]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return undefined;
        }

        const updateWidth = () => {
            setChartWidth(Math.max(element.clientWidth || 0, 320));
        };

        updateWidth();

        if (typeof ResizeObserver === "undefined") {
            return undefined;
        }

        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    if (!data.length) {
        return <div ref={containerRef} className={className} style={{ minHeight: emptyHeight, ...containerStyle }} />;
    }

    const chartHeight = emptyHeight;
    const margin = { top: 20, right: 20, bottom: 42, left: 60 };
    const innerWidth = Math.max(chartWidth - margin.left - margin.right, 1);
    const innerHeight = Math.max(chartHeight - margin.top - margin.bottom, 1);
    const highs = data.map((point) => Number(point.high ?? point.close ?? point.value ?? 0));
    const lows = data.map((point) => Number(point.low ?? point.close ?? point.value ?? 0));
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const priceRange = Math.max(maxPrice - minPrice, 1);
    const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

    const xForIndex = (index) => margin.left + ((index + 0.5) * innerWidth) / data.length;
    const yForPrice = (price) => margin.top + ((maxPrice - price) / priceRange) * innerHeight;
    const candleWidth = Math.max(Math.min((innerWidth / data.length) * 0.55, 18), 4);
    const yTicks = Array.from({ length: 5 }, (_, index) => minPrice + ((maxPrice - minPrice) * index) / 4).reverse();
    const xTicks = [
        0,
        Math.floor((data.length - 1) / 3),
        Math.floor(((data.length - 1) * 2) / 3),
        data.length - 1,
    ].filter((value, index, array) => array.indexOf(value) === index);

    const formatLabel = (point) => {
        if (typeof getLabel === "function") {
            return getLabel(point);
        }

        return point?.date ? new Date(point.date).toLocaleDateString() : "";
    };

    const getDateLabel = (point) => {
        if (!point) {
            return "";
        }

        const label = formatLabel(point);
        return label || "";
    };

    const formatPrice = (value) => Number(value ?? 0).toFixed(2);

    const tooltipMetrics = hoveredPoint
        ? [
              { label: "Open", value: formatPrice(hoveredPoint.open ?? hoveredPoint.value) },
              { label: "High", value: formatPrice(hoveredPoint.high ?? hoveredPoint.value) },
              { label: "Low", value: formatPrice(hoveredPoint.low ?? hoveredPoint.value) },
              { label: "Close", value: formatPrice(hoveredPoint.close ?? hoveredPoint.value) },
          ]
        : [];

    const tooltipWidth = 280;
    const tooltipHeight = 136;
    const hoveredTooltip = hoveredPoint
        ? {
              x: xForIndex(hoveredIndex),
              y: yForPrice(Number(hoveredPoint.high ?? hoveredPoint.close ?? hoveredPoint.value ?? 0)),
          }
        : null;
    const tooltipLeft = hoveredTooltip
        ? Math.min(
              Math.max(hoveredTooltip.x, tooltipWidth / 2 + 12),
              Math.max(chartWidth - tooltipWidth / 2 - 12, tooltipWidth / 2 + 12),
          )
        : 0;
    const placeTooltipBelow = hoveredTooltip ? hoveredTooltip.y - tooltipHeight - 12 < 12 : false;
    const tooltipTop = hoveredTooltip
        ? placeTooltipBelow
            ? Math.min(hoveredTooltip.y + 12, chartHeight - tooltipHeight - 12)
            : Math.max(hoveredTooltip.y - 12, 12)
        : 0;

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ position: "relative", width: "100%", height: "100%", ...containerStyle }}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                {yTicks.map((tick) => {
                    const y = yForPrice(tick);
                    return (
                        <g key={tick}>
                            <line
                                x1={margin.left}
                                x2={chartWidth - margin.right}
                                y1={y}
                                y2={y}
                                stroke="var(--glass-border)"
                                strokeDasharray="3 3"
                                opacity="0.5"
                            />
                            <text x={margin.left - 8} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="12">
                                ${tick.toFixed(2)}
                            </text>
                        </g>
                    );
                })}

                {data.map((point, index) => {
                    const open = Number(point.open ?? point.close ?? point.value ?? 0);
                    const high = Number(point.high ?? point.close ?? point.value ?? 0);
                    const low = Number(point.low ?? point.close ?? point.value ?? 0);
                    const close = Number(point.close ?? point.open ?? point.value ?? 0);
                    const isUp = close >= open;
                    const x = xForIndex(index);
                    const wickTop = yForPrice(high);
                    const wickBottom = yForPrice(low);
                    const bodyTop = yForPrice(Math.max(open, close));
                    const bodyBottom = yForPrice(Math.min(open, close));
                    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
                    const bodyX = x - candleWidth / 2;
                    const isHovered = hoveredIndex === index;

                    return (
                        <g
                            key={`${point.date ?? point.timestamp ?? index}-${index}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            style={{ cursor: "crosshair", opacity: isHovered ? 1 : 0.9 }}
                        >
                            <line
                                x1={x}
                                x2={x}
                                y1={wickTop}
                                y2={wickBottom}
                                stroke={isUp ? "#22c55e" : "#ef4444"}
                                strokeWidth={2}
                            />
                            <rect
                                x={bodyX}
                                y={bodyTop}
                                width={candleWidth}
                                height={bodyHeight}
                                fill={isUp ? "#22c55e" : "#ef4444"}
                                rx={2}
                                ry={2}
                            />
                        </g>
                    );
                })}

                {xTicks.map((tickIndex) => {
                    const point = data[tickIndex];
                    const x = xForIndex(tickIndex);
                    return (
                        <text
                            key={`${point.date ?? point.timestamp ?? tickIndex}-${tickIndex}`}
                            x={x}
                            y={chartHeight - 14}
                            textAnchor="middle"
                            fill="var(--text-muted)"
                            fontSize="12"
                        >
                            {getDateLabel(point)}
                        </text>
                    );
                })}
            </svg>

            {hoveredPoint && hoveredTooltip && (
                <div
                    style={{
                        position: "absolute",
                        left: tooltipLeft,
                        top: tooltipTop,
                        transform: `translate(-50%, ${placeTooltipBelow ? "0" : "-100%"})`,
                        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.84))",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 14,
                        padding: "0.9rem 1rem",
                        minWidth: 240,
                        maxWidth: 300,
                        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.28)",
                        backdropFilter: "blur(14px)",
                        pointerEvents: "none",
                        zIndex: 2,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 10,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.12em",
                                }}
                            >
                                Hovered candle
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-heading)",
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    marginTop: 2,
                                }}
                            >
                                {getDateLabel(hoveredPoint)}
                            </div>
                        </div>
                        <div
                            style={{
                                padding: "0.3rem 0.6rem",
                                borderRadius: 999,
                                background: trendIsPositive ? "rgba(34, 197, 94, 0.14)" : "rgba(239, 68, 68, 0.14)",
                                color: trendIsPositive ? "#4ade80" : "#f87171",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {trendIsPositive ? "Up" : "Down"}
                        </div>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 8,
                        }}
                    >
                        {tooltipMetrics.map((metric) => (
                            <div
                                key={metric.label}
                                style={{
                                    padding: "0.55rem 0.65rem",
                                    borderRadius: 10,
                                    background: "rgba(255, 255, 255, 0.04)",
                                    border: "1px solid rgba(255, 255, 255, 0.05)",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.12em",
                                    }}
                                >
                                    {metric.label}
                                </div>
                                <div
                                    style={{
                                        marginTop: 4,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color:
                                            metric.label === "Close"
                                                ? trendIsPositive
                                                    ? "#4ade80"
                                                    : "#f87171"
                                                : "var(--text-primary)",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    ${metric.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
