## Relevant Files

- `scripts/deployOceanNode.sh` – Bash script to deploy & configure an Ocean Node on Fluence.
- `scripts/publishAssets.ts` – TypeScript script using Ocean.js to publish `data.json` and `average-price.py` with free C2D.
- `agent/index.ts` – Entry point for the TypeScript agent orchestration and CLI interface.
- `agent/src/agentCore.ts` – Core agent initialization and configuration module.
- `agent/src/jobRunner.ts` – Job runner module for orchestrating agent workflow with Self attestation integration.
- `agent/src/selfAttestation.ts` – Self Protocol attestation module for age, residency, and role verification using ZK proofs.
- `agent/tsconfig.json` – TypeScript configuration for the agent module.
- `agent/.eslintrc.js` – ESLint configuration for code quality and standards.
- `agent/triggerC2D.ts` – Module to order & start C2D jobs via Ocean.js.
- `postprocessing/src/clients/asi1mini.ts` – ASI-1 mini client for intelligent real estate analysis.
- `postprocessing/src/managers/PostProcessingManager.ts` – Post-processing orchestration with fallback support.
- `pages/index.tsx` – Next.js landing page showing dataset & results.
- `components/WalletConnectButton.tsx` – Wallet connect component (MetaMask, WalletConnect).
- `components/AttestationStatus.tsx` – UI indicator of attestation state.
- `components/DatasetViewer.tsx` – Simple list/table of dataset & algorithm details.
- `components/ResultDisplay.tsx` – Chart/text output from ASI-1 mini analysis.
- `styles/globals.css` – Tailwind CSS imports & base styles.
- `test/agent.test.ts` – Unit tests for agent logic.
- `test/ui.test.tsx` – Integration tests for Next.js pages/components.
- `.github/workflows/ci.yml` – CI pipeline to run tests & linting.
- `README.md` – Setup instructions, architecture overview, demo steps.

### Notes

- Place unit tests alongside modules when feasible (e.g., `asi1mini.test.ts`).
- Use `npm run test` (Jest) to execute all tests.
- CI should run on every pull request.

## Tasks

- [ ] 1.0 Ocean Node Setup & Asset Publishing

  - [x] 1.1 Install Fluence CLI and verify local environment (Rust + wasm32 target).
  - [x] 1.2 **[Human]** use the account associated to the email bogdan.fazakas@gmail.com authorised by google with the api key [REDACTED] Fluence account & obtain deployment credits. if you need you can generate a ssh key so i can add it to the console and you to use the account
  - [x] 1.3 Write `scripts/deployOceanNode.sh` to deploy Ocean Node service on Fluence.
  - [x] 1.4 Configure Ocean Node with free compute-to-data settings.
  - [x] 1.5 Implement `scripts/publishAssets.ts` to publish `data.json` & `average-price.py` via Ocean.js.
  - [x] 1.6 Run script and confirm assets are visible on Ocean Node UI/API.
  - [x] 1.7 Document deployment & publishing steps in `README.md`.

- [ ] 2.0 Agent Development (Self Attestation & C2D Orchestration)

  - [x] 2.1 Initialise TypeScript project inside `agent/` (tsconfig, eslint).
  - [x] 2.2 Implement `selfAttestation.ts` using Self SDK to verify age, residency, role.
  - [x] 2.3 Build `triggerC2D.ts` to order dataset, start C2D job, and poll status.
  - [x] 2.4 Integrate error handling for missing/invalid attestations.
  - [x] 2.5 Enforce < 5-minute timeout; abort job if exceeded.
  - [x] 2.6 Expose agent functions via CLI (`npm run agent -- --runJob`).
  - [x] 2.7 Log job metadata to console & persist JSON for UI consumption.

- [x] 3.0 Post-Processing Integration ASI-1 mini

  - [x] 3.1 Install ASI-1 mini SDK.
  - [x] 3.2 Create `asi1mini.ts` to submit C2D output and receive summary/chart.
  - [x] 3.3 Normalise both responses to a common JSON schema for the UI.
  - [x] 3.4 Add unit tests for both clients covering success & error paths.

- [ ] 4.0 Frontend UI & Wallet Integration

  - [x] 4.1 Scaffold Next.js app with Tailwind & Wagmi.
  - [x] 4.2 Build `WalletConnectButton.tsx` supporting MetaMask & WalletConnect.
  - [ ] 4.3 Implement `AttestationStatus.tsx` to display real-time attestation state.
  - [ ] 4.4 Create `DatasetViewer.tsx` to list dataset & algorithm metadata from Ocean Node.
  - [ ] 4.5 Create `ResultDisplay.tsx` to render summary text & chart using a charting lib (e.g., Chart.js).
  - [ ] 4.6 Wire UI flow: Connect wallet → Verify Self → Run agent → Show loading → Display result.
  - [ ] 4.7 Style pages per Tailwind best practices & Ocean Protocol inspiration @https://oceanprotocol.com/about-us/media-kit/.

- [ ] 5.0 Testing, Error Handling, Deployment & Documentation
  - [ ] 5.3 **[Human]** take 3 relevant screenshots in the app that represent the hack and showcase the integrations of self, ASI-1 mini and fluence
  - [ ] 5.4 **[Human]** Record ≤ 5-minute demo video showing full flow.
  - [ ] 5.5 **[Human]** Upload video and ensure GitHub repo is public.
  - [ ] 5.6 Finalise `README.md` with setup, deployment, and demo instructions.
  - [ ] 5.7 Perform end-to-end test on Fluence to ensure SLA & < 5-minute run time.
