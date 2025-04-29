import { RELAY_API_URL } from "@/utils/secrets";
import axios from "axios";

export const relayClient = axios.create({
    baseURL: `${RELAY_API_URL}/relay`,
    headers: {
        "Content-Type": "application/json",
    },
});