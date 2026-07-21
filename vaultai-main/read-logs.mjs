import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const glReadClient = createClient({ chain: studionet });
const GENLAYER_CONTRACT = '0xE9773b7474B33b7218f815Fd87EE57A1eC82C243';

async function main() {
  try {
    console.log("Reading audit logs...");
    const raw = await glReadClient.readContract({
      address: GENLAYER_CONTRACT,
      functionName: 'get_audit_logs',
      args: [],
    });
    console.log("Raw output type:", typeof raw);
    
    let logs = [];
    if (typeof raw === 'string') {
        logs = JSON.parse(raw);
    } else {
        logs = raw;
    }

    console.log(`Found ${logs?.length || 0} logs.`);
    
    if (logs && logs.length > 0) {
      const last = logs[logs.length - 1];
      const latestLog = typeof last === 'string' ? JSON.parse(last) : last;
      console.log("Latest log parsed:");
      console.log(JSON.stringify(latestLog, null, 2));
    }
  } catch (err) {
    console.error("Error reading logs:", err);
  }
}
main();
