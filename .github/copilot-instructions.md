# GDG Blockchain Voting Platform - AI Coding Instructions

## Project Architecture

This is a **full-stack decentralized voting platform** with three main components:

### 1. Blockchain (`blockchain/`)
- **Framework**: Foundry (Solidity ^0.8.13+)
- **Contracts**: 
  - `Ballot.sol`: Vote casting with token-based authentication and 0.000001 ETH fee
  - `BallotRegistry.sol`: IPFS hash storage for ballot verification
- **Key Pattern**: Admin-only deployment, public voting with unique token verification
- **Test Framework**: `forge test` with standard Foundry Test structure
- **Deploy**: Use `makefile` commands (`make create_Ballot`) or `forge script`

### 2. Frontend (`frontend/`)
- **Stack**: React 19 + Vite + TypeScript + Tailwind CSS 4
- **Web3**: wagmi v2 + RainbowKit for wallet connection (Mainnet, Polygon, Sepolia)
- **Key Integrations**:
  - **Gemini AI**: PDF/image ballot OCR via `lib/gemini.ts` (`extractBallotData()`)
  - **Pinata**: IPFS uploads via `lib/ipfs.ts` (`uploadJSONToIPFS()`, `uploadToIPFS()`)
  - **Contract Interaction**: wagmi hooks (`useWriteContract`, `useSendTransaction`, `useWaitForTransactionReceipt`)
- **Config Pattern**: Contract addresses in `config/contracts.ts`, ABIs in `abi/` directory
- **Dev Server**: `npm run dev` (port 3000)

### 3. Backend (`server/`)
- **Stack**: Node.js + Express + MongoDB (Mongoose)
- **Purpose**: Voter registration, authentication, candidate management (separate from blockchain voting)
- **API Base**: `/api/v1/` with routes for auth, voters, candidates, healthcheck
- **Standard Patterns**:
  - `asyncHandler` wrapper for all controllers (replaces try-catch)
  - `ApiResponse` class for consistent responses
  - `ApiError` class for structured errors
  - JWT-based authentication with `verifyJWT` middleware
- **Dev Server**: `npm run dev` (nodemon, port 3000)

## Critical Development Workflows

### Blockchain Development
```bash
# In blockchain/ directory
forge build                    # Compile contracts
forge test                     # Run tests
make create_Ballot            # Deploy Ballot contract (requires .env: RPC_URL, LOCAL_PRIVATE_KEY)
make create_Ballot_Registry   # Deploy BallotRegistry
cast send <addr> "vote(bytes32,uint256)" <token> <candidateId> --private-key <key>
```

### Frontend Development
```bash
# In frontend/ directory
npm install
npm run dev              # Vite dev server
npm run build            # Production build (tsc + vite build)
```
**Required env vars**: `VITE_GEMINI_API_KEY`, `VITE_PINATA_JWT`

### Backend Development
```bash
# In server/ directory
npm install
npm run dev              # Nodemon auto-restart
npm start                # Production mode
```
**Required env vars**: See `server/dotenvExample.js` (MongoDB URI, JWT secrets, email config)

## Project-Specific Conventions

### Smart Contract Patterns
- **Vote Fee Mechanism**: All votes require `msg.value >= VOTE_FEE`, immediately transferred to `TREASURY` address
- **Token Hashing**: Frontend uses `keccak256(toHex(name + srNo))` for ballot tokens
- **Registry Storage**: IPFS hash + keccak256 ballot hash stored on-chain for verification

### Frontend Patterns
1. **Wagmi Transaction Flow**:
   ```typescript
   const { writeContractAsync, isPending } = useWriteContract();
   const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
   // Check isConnected before any transaction
   ```

2. **ABI Import Pattern**: ABIs live in `src/abi/*.ts` as exported constants (e.g., `BALLOT_REGISTRY_ABI`)

3. **Gemini OCR Integration**: 
   - Use `extractBallotData(file)` for ballot scanning
   - Returns structured `BallotData` with confidence scores
   - PDF.js worker loaded from CDN

4. **IPFS Upload Pattern**: Always upload to IPFS before blockchain transaction

### Backend Patterns
1. **Controller Structure**:
   ```javascript
   import { asyncHandler } from '../utils/asyncHandler.js';
   import { ApiResponse } from '../utils/api-response.js';
   import { ApiError } from '../utils/api-error.js';
   
   const myController = asyncHandler(async (req, res) => {
     // Logic
     return res.status(200).json(new ApiResponse(200, data, "Success message"));
   });
   ```

2. **Error Handling**: Throw `ApiError` instances, never raw `Error` objects

3. **Route Protection**: Apply `verifyJWT` middleware to secured routes

4. **Models**: Use Mongoose schemas with timestamps, enums for validation

## Key Integration Points

### Frontend ↔ Blockchain
- Contract addresses configured in `frontend/src/config/contracts.ts`
- Update after deployment: `BALLOT_CONTRACT_ADDRESS`, `BALLOT_REGISTRY_ADDRESS`
- Wagmi config in `wagmi.ts` with WalletConnect projectId

### Frontend ↔ Backend (Minimal)
- Backend manages voter registration DB (independent from blockchain)
- No direct API calls from frontend to backend in voting flow (blockchain-first design)

### Ballot Verification Flow
1. Admin uploads ballot PDF → Gemini extracts data → Upload to IPFS
2. Compute `keccak256(name + srNo)` → Store on BallotRegistry contract
3. Voter verifies token → Frontend checks against stored hash → Vote on Ballot contract

## Common Pitfalls

1. **Foundry Remappings**: Use `@openzeppelin/contracts/` and `@chainlink/contracts/` (see `foundry.toml`)
2. **Wagmi v2 Breaking Changes**: Use `useWriteContract` (not deprecated `useContractWrite`)
3. **IPFS Gateway Delays**: Test with Pinata gateway before mainnet deployment
4. **Gas Estimation**: Voting transactions may fail if `msg.value` < `VOTE_FEE`
5. **PDF.js Worker**: Must set `workerSrc` before using `pdfjsLib.getDocument()`
6. **MongoDB Connection**: Server crashes if `.env` missing or MongoDB unreachable

## Testing Guidelines

- **Blockchain**: Write unit tests in `test/*.t.sol` following Foundry conventions (`setUp()`, `testX()`)
- **Frontend**: No test files present (add with Vitest if needed)
- **Backend**: No test files present (add with Jest/Mocha if needed)

## File Reference Examples

- Ballot contract logic: [blockchain/src/Ballot.sol](blockchain/src/Ballot.sol)
- Voting page with wagmi hooks: [frontend/src/pages/VotingPage.tsx](frontend/src/pages/VotingPage.tsx)
- Ballot scanner with OCR: [frontend/src/components/BallotScanner.tsx](frontend/src/components/BallotScanner.tsx)
- Backend auth patterns: [server/src/controllers/auth.controllers.js](server/src/controllers/auth.controllers.js)
- Standard error handling: [server/src/utils/api-error.js](server/src/utils/api-error.js)
