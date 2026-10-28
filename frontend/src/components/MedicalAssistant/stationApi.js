import { STATION_URL, STATION_API_KEY } from "../../utills/baseUrl";

export { STATION_URL };

export class StationError extends Error {
    constructor(message, status, detail) {
        super(message);
        this.status = status;
        this.detail = detail || "";
    }
}

// fetch wrapper for the vitals station. `json` -> JSON body, `body` -> FormData / raw body.
export async function stationFetch(path, { method = "GET", json, body, signal } = {}) {
    const headers = {};
    if (STATION_API_KEY) headers["X-API-Key"] = STATION_API_KEY;
    let payload = body;
    if (json !== undefined && json !== null) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(json);
    }

    let res;
    try {
        res = await fetch(STATION_URL + path, { method, headers, body: payload, signal });
    } catch {
        throw new StationError(`Cannot reach the vitals station at ${STATION_URL}`);
    }

    if (!res.ok) {
        let detail = "";
        try {
            const d = (await res.json()).detail;
            if (typeof d === "string") detail = d;
        } catch { /* body was not JSON */ }
        const msg = res.status === 409
            ? "Another measurement is already running on the station"
            : detail || `Station error ${res.status}`;
        throw new StationError(msg, res.status, detail);
    }
    return res.json();
}

// <img> cannot send headers, so the key goes in the query string.
const keyQuery = () => (STATION_API_KEY ? `key=${encodeURIComponent(STATION_API_KEY)}&api_key=${encodeURIComponent(STATION_API_KEY)}` : "");

export const previewUrl = (camera, url, { width, fps } = {}) =>
    `${STATION_URL}/camera/preview?camera=${encodeURIComponent(camera)}` +
    (url ? `&url=${encodeURIComponent(url)}` : "") +
    (width ? `&width=${width}` : "") +
    (fps ? `&fps=${fps}` : "") +
    (STATION_API_KEY ? `&${keyQuery()}` : "");

export const resultImage = (r) =>
    r?.annotated_image_base64 ||
    (r?.annotated_image_url
        ? `${STATION_URL}${r.annotated_image_url}${STATION_API_KEY ? `?api_key=${encodeURIComponent(STATION_API_KEY)}` : ""}`
        : "");
