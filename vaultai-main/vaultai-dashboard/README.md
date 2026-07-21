# VAULTAI Dashboard

Next.js dashboard for the VAULTAI GenLayer and Arc treasury demo.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Environment

```text
GENLAYER_CONTRACT_ADDRESS=0x4012C3039393F0e26Bc06a66bCa90fCF0be7B934
NEXT_PUBLIC_GL_BURNER_KEY=your_genlayer_burner_private_key
ARC_PRIVATE_KEY=your_arc_relayer_private_key
ARC_RPC_URL=https://rpc.testnet.arc.network
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
```

Upstash is optional for local development. If omitted, treasury mappings are stored in `.local-registry.json`.
