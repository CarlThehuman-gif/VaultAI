"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import {
  GENLAYER_CONTRACT_ADDRESS,
  ARC_EXPLORER_URL,
  GENLAYER_STUDIO_URL,
  ARC_TESTNET,
} from "./config";

const glReadClient = createClient({ chain: studionet });

const TOKEN_ABI = ["function balanceOf(address account) view returns (uint256)"];
const MOCK_WETH = "0xa48d06a3E9df191B84dbb4402c63E9E439e9e828";
const MOCK_USDC = "0xe1283D7724C82593013a8CFd40141789E294874E";

const SIGNAL_META = {
  SAFE: { label: "SAFE", className: "signal-safe" },
  CAUTION: { label: "CAUTION", className: "signal-caution" },
  CRITICAL: { label: "CRITICAL", className: "signal-critical" },
};

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatToken(value) {
  if (!value) return "0.00";
  const number = Number(ethers.formatEther(value.toString()));
  if (!Number.isFinite(number)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: number >= 1000 ? 1 : 2,
    minimumFractionDigits: 2,
  }).format(number);
}

function riskPercent(score) {
  const pct = Math.round(Number(score ?? 0) * 100);
  return Math.min(100, Math.max(0, pct));
}

function Icon({ name }) {
  const common = {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  const paths = {
    wallet: (
      <>
        <path d="M3 7.5h15.5a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 17V7.5Z" />
        <path d="M16.5 12.5H21v3h-4.5a1.5 1.5 0 0 1 0-3Z" />
        <path d="M6 7.5V6a2 2 0 0 1 2-2h8" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5.7c0 4.6-3.2 7.6-8 9.3-4.8-1.7-8-4.7-8-9.3V6l8-3Z" />
        <path d="M9 12.2 11.1 14.3 15.5 9.9" />
      </>
    ),
    pulse: (
      <>
        <path d="M4 12h3l2-5 4 10 2-5h5" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />
      </>
    ),
    graph: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 4-7" />
      </>
    ),
    deploy: (
      <>
        <path d="M12 3v12" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 15v4h14v-4" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    external: (
      <>
        <path d="M14 5h5v5" />
        <path d="m10 14 9-9" />
        <path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? paths.shield}</svg>;
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M20 3v34" />
        <path d="M7.98 7.98 32.02 32.02" />
        <path d="M3 20h34" />
        <path d="M32.02 7.98 7.98 32.02" />
      </svg>
    </div>
  );
}

function Header({ walletShort, isConnecting, onConnect }) {
  return (
    <header className="topbar">
      <div className="brand">
        <BrandMark />
        <div>
          <h1>VAULTAI</h1>
          <p>AI treasury rebalancing on GenLayer and Arc</p>
        </div>
      </div>

      <div className="topbar-actions">
        <span className="network-chip">GenLayer Studionet</span>
        <span className="network-chip">Arc Testnet</span>
        {walletShort ? (
          <span className="wallet-chip">
            <Icon name="wallet" />
            {walletShort}
          </span>
        ) : (
          <button className="btn btn-primary" onClick={onConnect} disabled={isConnecting}>
            <Icon name="wallet" />
            {isConnecting ? "Connecting..." : "Connect wallet"}
          </button>
        )}
      </div>
    </header>
  );
}

function Metric({ label, value, subtext }) {
  return (
    <section className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {subtext && <small>{subtext}</small>}
    </section>
  );
}

function WorkflowStep({ number, title, text }) {
  return (
    <div className="workflow-step">
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function ResultPanel({ result, glTxHash }) {
  if (!result) return null;

  if (!result.success) {
    return (
      <section className="result-panel result-error">
        <div className="section-kicker">Last run</div>
        <h2>Execution failed</h2>
        <p>{result.error}</p>
      </section>
    );
  }

  const meta = SIGNAL_META[result.marketSignal] ?? SIGNAL_META.SAFE;
  const pct = riskPercent(result.riskScore);
  const actionLabel = result.action === "TRADE_EXECUTED" ? "Rebalance executed" : "Heartbeat recorded";

  return (
    <section className={`result-panel ${meta.className}`}>
      <div className="result-head">
        <div>
          <div className="section-kicker">Latest AI decision</div>
          <h2>{meta.label}</h2>
          <p>{actionLabel}</p>
        </div>
        <span className="signal-badge">{meta.label}</span>
      </div>

      <div className="risk-line">
        <div className="risk-label">
          <span>Risk score</span>
          <strong>{Number(result.riskScore ?? 0).toFixed(3)}</strong>
        </div>
        <div className="risk-track">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <p className="decision-copy">{result.reasoning}</p>

      <div className="link-row">
        {glTxHash && (
          <a href={`${GENLAYER_STUDIO_URL}/transactions/${glTxHash}`} target="_blank" rel="noreferrer">
            <Icon name="external" />
            GenLayer tx
          </a>
        )}
        {result.arcTxHash && (
          <a href={result.explorerUrl} target="_blank" rel="noreferrer">
            <Icon name="external" />
            Arc tx
          </a>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletShort, setWalletShort] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const [treasuryAddress, setTreasuryAddress] = useState(null);
  const [treasuryInfo, setTreasuryInfo] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [heartbeatStep, setHeartbeatStep] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [lastGlTxHash, setLastGlTxHash] = useState("");
  const [history, setHistory] = useState([]);
  const [globalConstitution, setGlobalConstitution] = useState(null);

  const loadTreasuryForWallet = async (wallet) => {
    try {
      const response = await fetch(`/api/get-treasury?wallet=${wallet}`);
      const data = await response.json();
      if (data.found) setTreasuryAddress(data.contractAddress);
    } catch {
      // The user can deploy a treasury from the UI if the lookup fails.
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then(async (accounts) => {
      if (accounts.length === 0) return;
      const address = accounts[0];
      setWalletAddress(address);
      setWalletShort(shortAddress(address));
      await loadTreasuryForWallet(address);
    });
  }, []);

  useEffect(() => {
    if (!walletAddress) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`vaultai:history:${walletAddress}`) || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, [walletAddress]);

  useEffect(() => {
    async function fetchConstitution() {
      try {
        const raw = await glReadClient.readContract({
          address: GENLAYER_CONTRACT_ADDRESS,
          functionName: "get_constitution",
          args: [],
        });
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        setGlobalConstitution(parsed);
      } catch {
        // Reads can fail while the Studio network is warming up.
      }
    }

    fetchConstitution();
  }, []);

  const fetchTreasuryInfo = useCallback(async (contractAddress) => {
    if (!contractAddress) return;

    try {
      const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
      const wethContract = new ethers.Contract(MOCK_WETH, TOKEN_ABI, provider);
      const usdcContract = new ethers.Contract(MOCK_USDC, TOKEN_ABI, provider);

      const [weth, usdc] = await Promise.all([
        wethContract.balanceOf(contractAddress),
        usdcContract.balanceOf(contractAddress),
      ]);

      setTreasuryInfo({
        weth: weth.toString(),
        usdc: usdc.toString(),
      });
    } catch (error) {
      console.warn("fetchTreasuryInfo failed:", error.message);
    }
  }, []);

  useEffect(() => {
    fetchTreasuryInfo(treasuryAddress);
  }, [treasuryAddress, fetchTreasuryInfo]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.alert("Please install MetaMask or another EVM wallet to use VAULTAI.");
      return;
    }

    setIsConnecting(true);
    try {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_TESTNET.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ARC_TESTNET],
          });
        }
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setWalletAddress(address);
      setWalletShort(shortAddress(address));
      await loadTreasuryForWallet(address);
    } catch (error) {
      console.error("Connect wallet failed:", error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const deployTreasury = async () => {
    setIsDeploying(true);
    setDeployError("");

    try {
      const response = await fetch("/api/deploy-treasury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();

      if (!data.success) {
        setDeployError(data.error ?? "Deployment failed. Please try again.");
        return;
      }

      setTreasuryAddress(data.contractAddress);
      await fetchTreasuryInfo(data.contractAddress);
    } catch (error) {
      setDeployError(error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const runHeartbeat = async () => {
    if (!treasuryAddress) return;

    setIsRunning(true);
    setLastResult(null);
    setLastGlTxHash("");
    setHeartbeatStep("Submitting treasury address to GenLayer consensus...");

    try {
      const startResponse = await fetch("/api/heartbeat-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treasuryAddress, userWallet: walletAddress }),
      });

      let startData;
      try {
        startData = await startResponse.json();
      } catch {
        throw new Error(`Server error. HTTP ${startResponse.status}`);
      }

      if (!startData.success) throw new Error(startData.error ?? "GenLayer submission failed");

      const { glTxHash } = startData;
      setLastGlTxHash(glTxHash);
      setHeartbeatStep(`Waiting for validator consensus. TX ${shortAddress(glTxHash)}`);

      let result = null;
      let attempts = 0;
      const maxAttempts = 40;

      while (!result && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts += 1;

        const checkResponse = await fetch("/api/heartbeat-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ glTxHash, treasuryAddress }),
        });

        let checkData;
        try {
          checkData = await checkResponse.json();
        } catch {
          continue;
        }

        if (checkData.decided) {
          result = checkData;
          break;
        }

        if (checkData.success === false && checkData.error) {
          throw new Error(`Heartbeat check failed: ${checkData.error}`);
        }

        setHeartbeatStep(`AI validators still comparing results. ${attempts * 3}s elapsed`);
      }

      if (!result) throw new Error("Consensus timed out after 2 minutes. Please try again.");

      setHeartbeatStep("Consensus complete. Arc execution checked.");
      if (!result.success) throw new Error(result.error ?? "Heartbeat failed");

      setLastResult(result);
      await fetchTreasuryInfo(treasuryAddress);

      const entry = { ...result, timestamp: Date.now() };
      const saved = JSON.parse(localStorage.getItem(`vaultai:history:${walletAddress}`) || "[]");
      const updated = [entry, ...saved].slice(0, 20);
      localStorage.setItem(`vaultai:history:${walletAddress}`, JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      setLastResult({ success: false, error: error.message });
      setHeartbeatStep("");
    } finally {
      setIsRunning(false);
    }
  };

  if (!walletAddress) {
    return (
      <main className="app-shell">
        <Header isConnecting={isConnecting} onConnect={connectWallet} />

        <section className="hero-grid">
          <div className="hero-copy">
            <div className="section-kicker">AI treasury control plane</div>
            <h2>Autonomous hedging for volatile DAO treasuries.</h2>
            <p>
              VAULTAI uses a GenLayer intelligent contract to read live market risk,
              form validator consensus, and route a controlled rebalance through Arc.
            </p>
            <button className="btn btn-primary btn-large" onClick={connectWallet} disabled={isConnecting}>
              <Icon name="wallet" />
              {isConnecting ? "Connecting..." : "Connect wallet"}
            </button>
          </div>

          <div className="control-surface">
            <div className="surface-header">
              <span>Live architecture</span>
              <strong>3-stage hedge loop</strong>
            </div>
            <WorkflowStep
              number="01"
              title="Market intelligence"
              text="GenLayer reads independent risk feeds and produces a consensus signal."
            />
            <WorkflowStep
              number="02"
              title="Policy guardrails"
              text="Python logic enforces risk tolerance, speed limits, and slippage rules."
            />
            <WorkflowStep
              number="03"
              title="Arc execution"
              text="Approved decisions are signed and relayed into an Arc treasury contract."
            />
          </div>
        </section>

        <section className="feature-grid">
          <Metric label="Oracle sources" value="3" subtext="Alternative.me, CoinGecko, Coinpaprika" />
          <Metric label="Default risk limit" value="70%" subtext="Only high-risk states trigger rebalancing" />
          <Metric label="Max sell speed" value="25%" subtext="Hard cap per heartbeat" />
        </section>
      </main>
    );
  }

  if (!treasuryAddress) {
    return (
      <main className="app-shell">
        <Header walletShort={walletShort} isConnecting={isConnecting} onConnect={connectWallet} />

        <section className="setup-layout">
          <div>
            <div className="section-kicker">Wallet connected</div>
            <h2>Deploy your Arc treasury.</h2>
            <p>
              This creates a personal treasury contract owned by your wallet. The backend
              deployer pays the gas and seeds the contract with testnet liquidity for the demo.
            </p>
          </div>

          <div className="setup-panel">
            <WorkflowStep
              number="01"
              title="Deploy"
              text="Create an Arc Testnet treasury contract mapped to your wallet."
            />
            <WorkflowStep
              number="02"
              title="Seed"
              text="Mint testnet WETH into the treasury and USDC into the demo router."
            />
            <WorkflowStep
              number="03"
              title="Run"
              text="Submit heartbeats through GenLayer and verify results on ArcScan."
            />

            <button className="btn btn-primary btn-wide" onClick={deployTreasury} disabled={isDeploying}>
              <Icon name="deploy" />
              {isDeploying ? "Deploying treasury..." : "Initialize treasury"}
            </button>

            {deployError && <p className="form-error">{deployError}</p>}
            {isDeploying && <p className="status-copy">Arc deployment usually takes 10 to 20 seconds.</p>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Header walletShort={walletShort} isConnecting={isConnecting} onConnect={connectWallet} />

      <section className="dashboard-head">
        <div>
          <div className="section-kicker">Treasury active</div>
          <h2>Risk monitor</h2>
          <p>
            Run a heartbeat to ask the GenLayer contract for a fresh market-risk
            consensus and relay any approved hedge into Arc.
          </p>
        </div>
        <button className="btn btn-primary btn-large" onClick={runHeartbeat} disabled={isRunning}>
          <Icon name="pulse" />
          {isRunning ? "Running heartbeat..." : "Run AI heartbeat"}
        </button>
      </section>

      <section className="metric-grid">
        <Metric label="Demo WETH" value={formatToken(treasuryInfo?.weth)} subtext="Volatile side" />
        <Metric label="Demo USDC" value={formatToken(treasuryInfo?.usdc)} subtext="Protected side" />
        <Metric label="Heartbeats" value={history.length.toString()} subtext="Local session history" />
        <Metric
          label="Risk policy"
          value={globalConstitution ? `${globalConstitution.risk_tolerance_pct}%` : "Loading"}
          subtext={globalConstitution ? `${globalConstitution.speed_limit}% max sell speed` : "Reading GenLayer"}
        />
      </section>

      <section className="address-grid">
        <a href={`${GENLAYER_STUDIO_URL}/contracts/${GENLAYER_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
          <span>GenLayer contract</span>
          <strong>{shortAddress(GENLAYER_CONTRACT_ADDRESS)}</strong>
          <Icon name="external" />
        </a>
        <a href={`${ARC_EXPLORER_URL}/address/${treasuryAddress}`} target="_blank" rel="noreferrer">
          <span>Arc treasury</span>
          <strong>{shortAddress(treasuryAddress)}</strong>
          <Icon name="external" />
        </a>
      </section>

      <section className="execution-grid">
        <div className="control-panel">
          <div className="section-kicker">Execution flow</div>
          <h2>Heartbeat pipeline</h2>
          <WorkflowStep
            number="01"
            title="Submit"
            text="Treasury address is sent to the GenLayer intelligent contract."
          />
          <WorkflowStep
            number="02"
            title="Consensus"
            text="Validators compare oracle-backed market analysis."
          />
          <WorkflowStep
            number="03"
            title="Relay"
            text="Authorized hedge instructions are signed and sent to Arc."
          />
          {heartbeatStep && <p className="heartbeat-step">{heartbeatStep}</p>}
        </div>

        <ResultPanel result={lastResult} glTxHash={lastGlTxHash || lastResult?.glTxHash} />
      </section>

      {history.length > 0 && (
        <section className="history-panel">
          <div className="section-kicker">Audit trail</div>
          <h2>Heartbeat history</h2>
          <div className="history-list">
            {history.map((item, index) => {
              const meta = SIGNAL_META[item.marketSignal] ?? SIGNAL_META.SAFE;
              return (
                <article className="history-item" key={`${item.glTxHash ?? index}-${item.timestamp}`}>
                  <div>
                    <span className={`signal-badge ${meta.className}`}>{item.marketSignal ?? "SAFE"}</span>
                    <strong>{item.action === "TRADE_EXECUTED" ? "Rebalance executed" : "Heartbeat safe"}</strong>
                    <p>{item.reasoning}</p>
                  </div>
                  <div className="history-meta">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>Risk {Number(item.riskScore ?? 0).toFixed(3)}</span>
                    {item.arcTxHash && (
                      <a href={item.explorerUrl} target="_blank" rel="noreferrer">
                        Arc tx
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
