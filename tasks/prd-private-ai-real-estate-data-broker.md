# Private AI-Powered Real Estate Data Broker — Product Requirements Document (PRD)

1. **Introduction / Overview**

The Private AI-Powered Real Estate Data Broker is a decentralized platform that enables attested users to run compute-to-data (C2D) jobs on sensitive real-estate datasets without exposing the raw data or proprietary algorithms. By combining Ocean Protocol's free C2D execution with Self Protocol attestations and Katana AI post-processing, the platform provides privacy-preserving, AI-driven insights for institutional investors, analysts, and researchers.

2. **Goals**

_G1._ Publish the `data.json` dataset and `average-price.py` algorithm on an Ocean Node with free C2D enabled.

_G2._ Gate C2D job execution behind valid Self Protocol attestations (age, residency, role).

_G3._ Complete a C2D job in under **5 minutes** and forward the result to Katana for enrichment.

_G4._ Display Katana's summary text and chart in a demo UI after a successful job.

_G5._ Gracefully deny access to users with missing or invalid attestations.

3. **User Stories**

- **US1:** _As an institutional real-estate investor_, I want to run an AI job on a trusted dataset so that I can obtain market insights without revealing proprietary data.
- **US2:** _As a real-estate analyst_, I want to view average price per m² per zone so that I can compare areas quickly.
- **US3:** _As an AI researcher_, I want to experiment with predictive models (e.g., linear regression) on the dataset so that I can benchmark performance while complying with data privacy rules.

4. **Functional Requirements**

1. **FR1** – Publish dataset (`data.json`) and algorithm (`average-price.py`) to Ocean Node with free execution.
1. **FR2** – Implement an agent that verifies Self Protocol attestations before job submission.
1. **FR3** – Trigger Ocean Node's C2D endpoint via the agent using Ocean.js.
1. **FR4** – Enforce job runtime ≤ 5 minutes and C2D resource limits (memory, CPU).
1. **FR5** – Send C2D outputs to Katana and receive summary text + optional chart.
1. **FR6** – Display results in a Next.js demo UI with Tailwind styling.
1. **FR7** – Provide wallet connect (MetaMask + WalletConnect) and show attestation status.
1. **FR8** – Log errors and gracefully handle: missing attestations, dataset indexing timeouts, Fluence host downtime, or C2D memory/time limits.

1. **Hedera & AI Integration Plan**

_Hedera Network Services_: **None in MVP** (can be added as a stretch goal if tokenization is required).

_AI / ML Components_:  
• **Katana SDK** – Primary inference service for summarization and chart generation.  
• **Fallback AI Service** – Fallback LLM if primary service is unreachable.  
• Future models: linear regression or XGBoost for property price prediction.

_Bridges / Oracles_: None for MVP.

_SDK / Tooling_: TypeScript, Ocean.js, Self SDK, Fluence CLI, Aqua agents, Wagmi for wallet integrations.

6. **Non-Goals (Out of Scope)**

- NG1 – On-chain payment or datatoken pricing (all assets free in MVP).
- NG2 – Secondary marketplace or bidding mechanics for datasets or algorithms.
- NG3 – Advanced analytics dashboards beyond basic result display.
- NG4 – Regulatory compliance (KYC/AML) enforcement in MVP.

7. **Design Considerations (Optional)**

- Follow Tailwind CSS best practices; mimic Ocean Portal styling where convenient.
- Responsive layout prioritising desktop first, with graceful degradation on mobile.
- Clear status indicators: _Connecting wallet → Verifying attestation → Running job → Processing result → Done / Error_.

8. **Technical Considerations (Optional)**

- Fluence hosting limits and potential downtime affecting Ocean Node indexing.
- C2D job resource caps (memory/time) for large datasets.
- Katana API output format is still TBD—requires integration test.
- May need persistent storage (e.g., IPFS) for large result files in future phases.

9. **Acceptance Criteria & Hackathon Deliverables**

- AC1 – Dataset and algorithm visible via Ocean Node UI or API endpoint.
- AC2 – Valid attested user can execute a C2D job that completes ≤ 5 minutes.
- AC3 – Katana returns a summary or chart automatically displayed in UI.
- AC4 – Invalid or missing attestations are blocked with user-friendly message.
- AC5 – Demo video (≤ 5 min) shows connect → compute → result flow.
- AC6 – All source code in public GitHub repo; README with setup instructions.

10. **Success Metrics**

- SM1 – Number of unique wallet connections during demo/judging.
- SM2 – Successful C2D job runs / total attempts ≥ 90 %.
- SM3 – Judge feedback score ≥ 8 / 10 for usability and innovation.

11. **Optional / Stretch Goals**

- Tokenise datasets using Hedera Token Service for paid access.
- Integrate Chainlink CCIP for cross-chain settlement.
- Add anomaly-detection model flags via Katana or custom ML.
- Support private datasets gated by granular Self Protocol roles.
- Include Ledger wallet support.

12. **Open Questions**

- OQ1 – Final Katana API response schema (JSON vs. binary chart image).
- OQ2 – Fluence hosting SLA and performance under concurrent load.
- OQ3 – Need for persistent storage of large C2D outputs (IPFS or Fluence FS).
- OQ4 – Ocean Node resource limits and mitigation strategies if exceeded.
