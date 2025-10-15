import React, { useEffect, useState } from 'react';
import { getBusStops } from '../services/api';

const BusStopsComponent = () => {
    const [busStops, setBusStops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBusStops = async () => {
            try {
                const data = await getBusStops();
                console.log("Fetched bus stops:", data); // Debug print
                setBusStops(data.value || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBusStops();
    }, []);

    if (loading) return <div>Loading bus stops...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Bus Stops (showing first 10):</h2>
            <ul>
                {busStops.slice(0, 10).map((stop) => (
                    <li key={stop.BusStopCode}>
                        {stop.Description} ({stop.BusStopCode})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusStopsComponent;