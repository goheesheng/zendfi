# Smart Contract Reference

See [Architecture Overview](./overview.md) for the full two-layer diagram and addresses.

## Decimal Conventions

| Asset / Value | Decimals | Notes |
|---|---|---|
| Strikes | 8 | Chainlink convention. `strike / 1e8` for display. |
| USDC | 6 | `amount / 1e6` for display. |
| WETH | 18 | |
| cbBTC | 8 | |

---

## LoanCoordinator

**Address:** `0x6278B8B09Df960599fb19EBa4b79aed0ED6B077b`

ZendFi's entry-point contract. Holds collateral during the RFQ auction and orchestrates settlement.

> **Important:** LoanCoordinator does NOT emit its own RFQ lifecycle events (`OfferMade`, `QuotationSettled`, `QuotationCancelled`). Listen on OptionFactory for those. LoanCoordinator only emits `LoanRequested` and `FeeCollected`.

### Functions

#### `requestLoan(params) → uint256 quotationId`

Deposits collateral and opens an RFQ. Called by borrowers.

```solidity
struct RequestLoanParams {
  address collateralToken;      // WETH or cbBTC
  address priceFeed;            // Chainlink feed address
  address settlementToken;      // USDC
  uint256 collateralAmount;     // in collateral decimals
  uint256 strike;               // 8 decimals (Chainlink)
  uint256 expiryTimestamp;      // Unix seconds
  uint256 offerEndTimestamp;    // Unix seconds (now + 30s)
  uint256 minSettlementAmount;  // minimum USDC to accept (6 decimals)
  bool    convertToLimitOrder;  // keep order open if no offer in window
  string  requesterPublicKey;   // ECDH compressed public key (hex)
}
```

The collateral token must be approved for `LoanCoordinator` before calling.

#### `settleQuotationEarly(quotationId, offerAmount, nonce, offeror)`

Accepts a specific offer before the auction window closes.

| Param | Type | Description |
|---|---|---|
| `quotationId` | `uint256` | From the `LoanRequested` event |
| `offerAmount` | `uint256` | USDC amount (6 decimals) from decrypted offer |
| `nonce` | `uint64` | From the decrypted offer |
| `offeror` | `address` | Market maker address |

#### `cancelLoan(quotationId)`

Cancels a pending loan request and returns collateral. Only callable by the requester.

#### `handleSettlement(quotationId, settledOptionContract)` *(internal)*

Called by OptionFactory during settlement. Not called directly by borrowers.

#### `loanRequests(quotationId) → LoanRequest` *(view)*

Returns the stored loan request struct:

```solidity
struct LoanRequest {
  address requester;
  uint256 collateralAmount;
  uint256 strike;
  uint256 expiryTimestamp;
  address collateralToken;
  address settlementToken;
  bool    isSettled;
  address settledOptionContract;
}
```

#### Other View Functions

| Function | Returns | Description |
|---|---|---|
| `fee()` | `uint256` | Current protocol fee in BPS |
| `MAX_FEE()` | `uint256` | Maximum allowed fee in BPS |
| `optionFactory()` | `address` | OptionFactory address |
| `totalLockedCollateral(token)` | `uint256` | Total collateral locked per token |

### Events

#### `LoanRequested`

```solidity
event LoanRequested(
  uint256 indexed quotationId,
  address indexed requester,
  address collateralToken,
  address settlementToken,
  uint256 collateralAmount,
  uint256 minSettlementAmount,
  uint256 strike,
  uint256 expiryTimestamp,
  uint256 offerEndTimestamp,
  bool    convertToLimitOrder
)
```

#### `FeeCollected`

```solidity
event FeeCollected(
  uint256 indexed quotationId,
  uint256 feeAmount
)
```

---

## PhysicallySettledCallOption

**Address (implementation):** `0x72fc2920137E42473935D511B4AD29Efa34164C8`

Each settled loan creates a proxy instance of this contract. The borrower is the `buyer`; the market maker is the `seller`.

### Functions

#### Exercise Functions (called by borrower at expiry)

| Function | Description |
|---|---|
| `exercise()` | Pay USDC strike price, receive collateral back |
| `doNotExercise()` | Walk away — keep USDC, lender keeps collateral |
| `swapAndExercise(address aggregator, bytes swapData)` | Sell portion of collateral via DEX aggregator to cover USDC cost |

#### Query Functions

| Function | Returns | Description |
|---|---|---|
| `buyer()` | `address` | Borrower address |
| `seller()` | `address` | Lender / market maker address |
| `collateralToken()` | `address` | WETH or cbBTC |
| `collateralAmount()` | `uint256` | Collateral locked (native decimals) |
| `expiryTimestamp()` | `uint256` | Option expiry (Unix seconds) |
| `getStrikes()` | `uint256[]` | Strike prices (8 decimals each) |
| `getTWAP()` | `uint256` | Time-weighted average price at settlement (8 decimals) |
| `isITM(uint256 price)` | `bool` | Whether option is in-the-money at given price |
| `optionSettled()` | `bool` | Whether option has been settled |
| `calculateDeliveryAmount()` | `uint256` | USDC delivery amount required for exercise |
| `EXERCISE_WINDOW()` | `uint256` | Exercise window duration in seconds |
| `PRICE_DECIMALS()` | `uint256` | Decimal precision of price values |

### Events

```solidity
event OptionExercised(
  address indexed buyer,
  address indexed seller,
  address collateralToken,
  address deliveryCollateral,
  uint256 collateralAmount,
  uint256 deliveryAmount
)

event OptionNotExercised(
  address indexed buyer,
  address indexed seller,
  address collateralToken,
  uint256 collateralAmount,
  bool    explicitDecision
)

event OptionExpired(
  address indexed optionAddress,
  uint256 settlementPrice
)
```

---

## OptionFactory

**Address:** `0x1aDcD391CF15Fb699Ed29B1D394F4A64106886e5`  
(Also available via `client.chainConfig.contracts.optionFactory`)

Thetanuts V4 core contract. Runs the sealed-bid RFQ auction and deploys option contracts. ZendFi listens to its events but does not call it directly — `LoanCoordinator` calls it internally.

### Events Listened To

```solidity
event QuotationRequested(
  uint256 indexed quotationId,
  address indexed requester,
  string  requesterPublicKey
)

event QuotationSettled(
  uint256 indexed quotationId,
  address indexed requester,
  address indexed winner,
  address optionAddress       // the deployed PhysicallySettledCallOption proxy
)

event QuotationCancelled(
  uint256 indexed quotationId
)

event OfferMade(
  uint256 indexed quotationId,
  address indexed offeror,
  bytes   offerSignature,
  string  signingKey,
  string  signedOfferForRequester  // encrypted offer data for borrower
)

event OfferRevealed(
  uint256 indexed quotationId,
  address indexed offeror,
  uint256 amount
)

event OfferAcceptedEarly(
  uint256 indexed quotationId,
  address indexed offeror,
  uint256 offerAmount
)

event OfferCancelled(
  uint256 indexed quotationId,
  address indexed offeror,
  bytes   offerSignature
)
```

---

## LoanHandler

**Address:** `0x6e0019bF9a44B60d57435a032Cb86b716629C08E`

Custom option type registered with OptionFactory. Proxy instances are deployed at settlement. Emits one event:

```solidity
event LoanSettled(
  address indexed coordinator,
  address indexed requester,
  address indexed finalOption,
  address collateralToken,
  address settlementToken,
  uint256 collateralAmount,
  uint256 settlementAmount,
  uint256 quotationId
)
```

---

## ERC20 Interactions

ZendFi calls these standard functions on WETH, cbBTC, and USDC:

| Function | Used For |
|---|---|
| `approve(spender, amount)` | Approve LoanCoordinator to pull collateral before `requestLoan()` |
| `balanceOf(account)` | Display user's collateral balance and MM liquidity |
| `allowance(owner, spender)` | Check existing allowance before approving |

The `ensureAllowance()` helper in `ThetanutsService` checks existing allowance and only sends an `approve` transaction if current allowance is insufficient.
