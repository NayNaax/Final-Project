import React, { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { api } from "../lib/apiClient";
import { LoadingSpinner } from "./LoadingSpinner";

export function SparklineChart({ symbol, color = "#10b981", width = 120, height = 40 }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchSparkline = async () => {
            try {
                const res = await api.get(`/stocks/${symbol}/sparkline`, { cacheMs: 60000 });
                if (mounted && Array.isArray(res)) {
                    // Extract close prices
                    setData(res.map((d) => ({ price: d.close })));
                }
            } catch (err) {
                console.error("Failed to load sparkline for", symbol);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchSparkline();
        return () => {
            mounted = false;
        };
    }, [symbol]);

    if (loading)
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LoadingSpinner />
            </div>
        );
    if (data.length === 0)
        return (
            <div style={{ width, height, opacity: 0.5, fontSize: "0.8rem", display: "flex", alignItems: "center" }}>
                No data
            </div>
        );

    const min = Math.min(...data.map((d) => d.price));
    const max = Math.max(...data.map((d) => d.price));

    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`color-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        fillOpacity={1}
                        fill={`url(#color-${symbol})`}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
