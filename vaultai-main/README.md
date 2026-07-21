# VAULTAI

VAULTAI is an AI treasury rebalancing system built with a GenLayer Intelligent Contract, Arc Testnet smart contracts, and a Next.js dashboard.

The product monitors crypto market risk through multiple public data sources. When GenLayer validators agree that risk is above the configured threshold, the backend relays a signed hedge instruction to an Arc treasury contract.

## Core Flow

```text
User connects wallet
        |
Deploy personal Arc treasury
        |
Run AI heartbeat
        |
GenLayer reads live market data
        |
Validators reach consensus
        |
Python policy checks risk threshold
        |
If risk is high, backend signs the decision
        |
Arc treasury executes the rebalance
        |
User verifies GenLayer and Arc transactions
```

## Components

```text
.
|-- vaultai_intelligent_contract.py        GenLayer Intelligent Contract
|-- arc-contracts/                   Solidity treasury contracts and deploy scripts
|-- vaultai-dashboard/         Next.js dashboard and API relayer routes
|-- heartbeat-cron.js                Optional autonomous heartbeat runner
|-- deploy-genlayer.mjs              GenLayer deployment helper
`-- README.md
```

## Intelligent Contract

`vaultai_intelligent_contract.py` defines `VaultAIIntelligentContract`, a GenLayer contract that:

- Reads Alternative.me, CoinGecko, and Coinpaprika market data.
- Asks validators to produce a structured risk score and market signal.
- Uses deterministic Python logic to decide whether a trade is authorized.
- Stores audit logs for the dashboard and backend relayer.

Current deployed GenLayer contract:

```text
0x4012C3039393F0e26Bc06a66bCa90fCF0be7B934
```

## Dashboard

The dashboard lives in `vaultai-dashboard`.

```bash
cd vaultai-dashboard
npm install
npm run dev
```

Required environment variables for production:

```text
GENLAYER_CONTRACT_ADDRESS=0x4012C3039393F0e26Bc06a66bCa90fCF0be7B934
NEXT_PUBLIC_GL_BURNER_KEY=your_genlayer_burner_private_key
ARC_PRIVATE_KEY=your_arc_relayer_private_key
ARC_RPC_URL=https://rpc.testnet.arc.network
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
```

`KV_REST_API_URL` and `KV_REST_API_TOKEN` are optional locally. Without them, the app falls back to a local registry file.

## Arc Contracts

The Arc contracts live in `arc-contracts/contracts`.

- `VaultAI.sol` holds and rebalances testnet treasury assets.
- `VaultAIDemo.sol` provides a lightweight simulated treasury flow.
- `MockERC20.sol` and `MockSwapRouter.sol` support the testnet demo.

## License

MIT
