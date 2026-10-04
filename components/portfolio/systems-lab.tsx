"use client"

import { useState } from "react"
import {
  BotIcon,
  CheckCircle2Icon,
  CpuIcon,
  GitPullRequestIcon,
  LayersIcon,
  PlayIcon,
  RadioIcon,
  RefreshCwIcon,
  RocketIcon,
  SparklesIcon,
  TerminalIcon,
  ZapIcon,
} from "lucide-react"

import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/components/panel"
import { cn } from "@/lib/utils"

type LabScenario = {
  id: string
  title: string
  category: "ai-agent" | "release-hub" | "webrtc"
  badge: string
  icon: typeof BotIcon
  description: string
  metrics: { label: string; value: string }[]
  inputSnippet: string
  outputLogs: string[]
  conclusion: string
}

const SCENARIOS: LabScenario[] = [
  {
    id: "ai-pr-review",
    title: "AI PR Review Agent",
    category: "ai-agent",
    badge: "Qwen 40B · H200 GPU",
    icon: BotIcon,
    description:
      "Autonomous code review agent deployed on NVIDIA H200 (140GB VRAM) evaluating pull requests for bugs, performance leaks, and security vulnerabilities.",
    metrics: [
      { label: "Hardware", value: "NVIDIA H200 GPU" },
      { label: "VRAM Allocation", value: "140 GB" },
      { label: "Model Weights", value: "Qwen 40B+" },
      { label: "Throughput", value: "88.4 tok/s" },
    ],
    inputSnippet: `// PR #142: auth/jwt-handler.ts
- const token = req.headers['authorization'];
- if (!token) return res.status(401);
+ const authHeader = req.headers.authorization;
+ if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid token format' });
+ const token = authHeader.split(' ')[1];
+ const decoded = await verifyJwtWithRevocationCheck(token, redisClient);`,
    outputLogs: [
      "[INFO] Loading Qwen 40B context into H200 tensor cores...",
      "[ANALYSIS] Scanning AST diff and control flow graph...",
      "[SECURITY] Verified JWT Bearer prefix sanitization: PASSED",
      "[CACHE] Redis revocation blacklist validation checked: PASSED",
      "[OPTIMIZATION] Memory footprint: Zero overhead allocation",
    ],
    conclusion:
      "✅ PR Review Passed: No security flaws or memory leaks detected. Ready to merge into main.",
  },
  {
    id: "release-automation",
    title: "Release Automation Hub",
    category: "release-hub",
    badge: "Next.js · Playwright",
    icon: RocketIcon,
    description:
      "Centralized release management platform consolidating multi-program deployments from manual Excel sheets into automated, real-time pipelines.",
    metrics: [
      { label: "Framework", value: "Next.js 16 (SSR)" },
      { label: "Testing Suite", value: "Playwright E2E" },
      { label: "Consolidation", value: "100% Automated" },
      { label: "Sync Latency", value: "< 50ms" },
    ],
    inputSnippet: `// release.config.ts: Unified Multi-Program Manifest
export default defineReleasePipeline({
  programs: ['transit-core', 'ticketing-api', 'edge-gateway'],
  validation: {
    e2eSuite: 'playwright test --project=chromium,firefox',
    excelLegacySync: 'auto-reconcile-bidirectional',
    zeroDowntimeGate: true
  }
});`,
    outputLogs: [
      "[PIPELINE] Initializing unified release bundle for 3 programs...",
      "[TEST] Running Playwright E2E test matrix: 48/48 suites passed (1.2s)",
      "[SYNC] Consolidating program release records from legacy spreadsheets...",
      "[GATE] Zero-downtime health check & staging verification complete",
      "[AUDIT] Generated automated changelog and artifact checksums",
    ],
    conclusion:
      "🚀 Release Pipeline Ready: Multi-program release consolidated successfully with zero manual tracking errors.",
  },
  {
    id: "webrtc-signaling",
    title: "WebRTC 1:1 Video Mesh",
    category: "webrtc",
    badge: "Socket.io · TURN/STUN",
    icon: RadioIcon,
    description:
      "Low-latency real-time signaling engine for peer-to-peer 1:1 mentorship and mock video interviews built for HelixQue.",
    metrics: [
      { label: "Signaling", value: "Socket.io Engine" },
      { label: "NAT Traversal", value: "Custom TURN/STUN" },
      { label: "P2P Latency", value: "24 ms (avg)" },
      { label: "Active Concurrency", value: "100+ Live Users" },
    ],
    inputSnippet: `// webrtc/signaling-mesh.ts
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:turn.helixque.io', username: 'guest', credential: 'jwt' }
  ]
});
socket.on('ice-candidate', (candidate) => peerConnection.addIceCandidate(candidate));`,
    outputLogs: [
      "[WEBRTC] Initializing ICE candidate exchange via Socket.io signaling...",
      "[STUN] NAT topology discovered: Full Cone NAT",
      "[P2P] Established direct SRTP media stream across nodes",
      "[METRICS] Round-trip latency: 22ms | Packet loss: 0.00%",
      "[AUDIO/VIDEO] VP9/Opus codecs negotiated at 1080p 60fps",
    ],
    conclusion:
      "⚡ WebRTC Mesh Online: Direct P2P tunnel established with sub-30ms glass-to-glass latency.",
  },
]

/**
 * SystemsLab — Interactive live workstation showcasing Jayanth's real-world
 * engineering implementations:
 *  1. AI PR Review Agent (Qwen 40B on H200 GPU)
 *  2. Release Management Automation Platform (Next.js & Playwright)
 *  3. Low-Latency WebRTC Signaling (HelixQue)
 */
export function SystemsLab() {
  const [activeTab, setActiveTab] = useState<string>("ai-pr-review")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [executionCount, setExecutionCount] = useState<number>(1)

  const activeScenario =
    SCENARIOS.find((s) => s.id === activeTab) ?? SCENARIOS[0]!

  const handleRunSimulation = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setExecutionCount((prev) => prev + 1)
    }, 600)
  }

  return (
    <Panel id="lab">
      <PanelHeader>
        <PanelTitle>
          <a href="#lab" className="flex items-center gap-2">
            <TerminalIcon className="size-4 text-muted-foreground" />
            <span>Interactive Systems Lab</span>
          </a>
          <PanelTitleSup>({SCENARIOS.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <PanelContent className="space-y-4">
        {/* Scenario Selection Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-line pb-3">
          {SCENARIOS.map((scenario) => {
            const isActive = scenario.id === activeTab
            const Icon = scenario.icon
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setActiveTab(scenario.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-mono transition-all",
                  isActive
                    ? "border-foreground bg-foreground text-background font-medium shadow-xs"
                    : "border-border bg-muted/40 text-muted-foreground hover:border-line hover:bg-accent-muted hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{scenario.title}</span>
                <span
                  className={cn(
                    "rounded-sm px-1 py-0.2 text-[10px]",
                    isActive
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {scenario.badge}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Scenario Card */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {activeScenario.description}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isRunning}
              className={cn(
                "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-line bg-background px-3 font-mono text-xs font-medium text-foreground transition-all hover:bg-accent-muted active:scale-98 disabled:opacity-60",
                isRunning && "animate-pulse"
              )}
            >
              {isRunning ? (
                <>
                  <RefreshCwIcon className="size-3.5 animate-spin" />
                  <span>Executing…</span>
                </>
              ) : (
                <>
                  <PlayIcon className="size-3.5 fill-current" />
                  <span>Simulate Run</span>
                </>
              )}
            </button>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {activeScenario.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-md border border-line bg-muted/30 p-2 text-left"
              >
                <div className="text-[11px] font-mono text-muted-foreground">
                  {metric.label}
                </div>
                <div className="text-xs font-mono font-medium text-foreground">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Code Input & Execution Console */}
          <div className="overflow-hidden rounded-lg border border-line bg-zinc-950 font-mono text-xs text-zinc-200 dark:bg-zinc-950">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3 py-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-zinc-200">
                  {activeScenario.title} · Live Session #{executionCount}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                <ZapIcon className="size-3 text-amber-400" />
                <span>Zero Latency</span>
              </div>
            </div>

            {/* Input Code Block */}
            <div className="border-b border-zinc-800/80 bg-zinc-950/80 p-3">
              <div className="mb-1 text-[10px] tracking-wider uppercase text-zinc-500">
                Code / Payload Input
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
                <code>{activeScenario.inputSnippet}</code>
              </pre>
            </div>

            {/* Live Pipeline / Agent Output Stream */}
            <div className="space-y-1 bg-zinc-950 p-3">
              <div className="mb-1 text-[10px] tracking-wider uppercase text-zinc-500">
                Execution Stream
              </div>
              {activeScenario.outputLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-300"
                >
                  <span className="text-emerald-400 select-none">❯</span>
                  <span>{log}</span>
                </div>
              ))}

              <div className="mt-2.5 flex items-center gap-1.5 border-t border-zinc-800/60 pt-2 font-medium text-emerald-400">
                <CheckCircle2Icon className="size-3.5 shrink-0" />
                <span>{activeScenario.conclusion}</span>
              </div>
            </div>
          </div>
        </div>
      </PanelContent>
    </Panel>
  )
}
