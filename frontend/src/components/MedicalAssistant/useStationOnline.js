import { useEffect, useState } from "react";
import { stationFetch } from "./stationApi";

const CHECK_MS = 30000;
const TIMEOUT_MS = 3000;
const OFFLINE = { online: false, weight: false, height: false };

// Polls GET /health so the Capture buttons only show where a working station is reachable.
export default function useStationOnline() {
    const [state, setState] = useState(OFFLINE);

    useEffect(() => {
        let alive = true;
        const check = async () => {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
            try {
                const h = await stationFetch("/health", { signal: ctrl.signal });
                if (alive) setState({ online: !!h.ok, weight: !!h.weight?.available, height: !!h.height?.available });
            } catch {
                if (alive) setState(OFFLINE);
            } finally {
                clearTimeout(timer);
            }
        };
        check();
        const id = setInterval(check, CHECK_MS);
        return () => { alive = false; clearInterval(id); };
    }, []);

    return state;
}
