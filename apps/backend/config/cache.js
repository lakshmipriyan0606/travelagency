import NodeCache from "node-cache";

// stdTTL: default time-to-live in seconds for each key
// checkperiod: interval (seconds) to auto-delete expired keys
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

export default cache;
