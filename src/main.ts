// ZendFi - Main entry point
// Connects the Thetanuts SDK service layer to the UI

import './styles/main.css';
import { ThetanutsService } from './services/thetanuts';
import { walletService } from './services/wallet';
import { stateManager } from './services/state';
import {
  LOAN_ASSETS,
  USDC_ADDRESS,
  STRIKE_DECIMALS,
  HOURS_PER_YEAR,
  DEFAULT_MARKET_MAKER,
  type AssetKey,
} from './services/constants';
import { ethers } from 'ethers';
import type { Loan, TabId } from './types';

// ─── Bootstrap ───

const readProvider = walletService.getReadProvider();
const service = new ThetanutsService(readProvider);

// DOM references
const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
const $$ = (sel: string) => document.querySelectorAll(sel);

// ─── Wallet Connection ───

$('#connectBtn').addEventListener('click', async () => {
  try {
    const state = await walletService.connect();
    if (state.signer && state.address) {
      service.setSigner(state.signer, state.address);
      stateManager.setConnectedAddress(state.address);
      updateWalletUI(state.address);
      await refreshAfterConnect();
    }
  } catch (err: any) {
    showNotification(err.message || 'Failed to connect wallet', 'error');
  }
});

function updateWalletUI(address: string) {
  $('#connectBtn').classList.add('hidden');
  $('#walletInfo').classList.remove('hidden');
  const addrEl = $('#walletAddr');
  addrEl.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function refreshAfterConnect() {
  await Promise.all([updateWalletBalance(), updateMmBalance(), loadStrikeOptions()]);
  setupEventListeners();
}

walletService.onChange((state) => {
  if (state.address) {
    stateManager.setConnectedAddress(state.address);
    updateWalletUI(state.address);
  } else {
    stateManager.setConnectedAddress(null);
    $('#connectBtn').classList.remove('hidden');
    $('#walletInfo').classList.add('hidden');
  }
});

// ─── Tab Navigation ───

$$('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab') as TabId;
    if (!tab) return;
    $$('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.tab-content').forEach((c) => c.classList.add('hidden'));
    $(`#tab-${tab}`).classList.remove('hidden');
    stateManager.setActiveTab(tab);
    if (tab === 'loans') renderActiveLoans();
    if (tab === 'history') renderHistory();
    if (tab === 'lend') renderLending();
  });
});

// ─── Borrow Tab: Deposit Input ───

$('#depositAmount').addEventListener('input', updateReceiveAmount);
$('#collateralSelector').addEventListener('click', () => $('#collateralModal').classList.remove('hidden'));
$('#strikeSelector').addEventListener('click', () => {
  loadStrikeOptions();
  $('#strikeModal').classList.remove('hidden');
});

// Close modals
$$('.modal-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.closest('.modal-overlay')?.classList.add('hidden');
  });
});
$$('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});

function updateReceiveAmount() {
  const deposit = parseFloat(($('#depositAmount') as HTMLInputElement).value) || 0;
  const state = stateManager.getState();
  const strike = state.selectedStrike;
  const expiry = state.selectedExpiry;

  if (deposit <= 0 || !strike || !expiry) {
    ($('#receiveAmount') as HTMLInputElement).value = '';
    $('#repayDate').textContent = '--';
    $('#repayAmount').textContent = '--';
    $('#effectiveApr').textContent = '--';
    ($('#reviewBtn') as HTMLButtonElement).disabled = true;
    return;
  }

  // For a physical call option: borrower deposits collateral, receives USDC
  // Receive amount ~ deposit * strike (approximately, minus fees)
  const receiveEstimate = deposit * strike * 0.95; // ~5% discount estimate
  const repay = deposit * strike; // Strike price is repayment
  const now = Math.floor(Date.now() / 1000);
  const hoursToExpiry = (expiry - now) / 3600;
  const apr = ((repay / receiveEstimate - 1) * HOURS_PER_YEAR) / hoursToExpiry * 100;

  ($('#receiveAmount') as HTMLInputElement).value = receiveEstimate.toFixed(2);
  $('#repayDate').textContent = new Date(expiry * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  $('#repayAmount').textContent = `${repay.toFixed(2)} USDC`;
  $('#effectiveApr').textContent = `${apr.toFixed(1)}%`;
  ($('#reviewBtn') as HTMLButtonElement).disabled = false;
}

// ─── Collateral Selection ───

function renderCollateralOptions() {
  const container = $('#collateralOptions');
  container.textContent = '';
  for (const [key, asset] of Object.entries(LOAN_ASSETS)) {
    const option = document.createElement('div');
    option.className = 'input-row';
    option.style.cursor = 'pointer';
    option.style.marginBottom = '8px';

    const icon = document.createElement('span');
    icon.style.fontSize = '20px';
    icon.style.marginRight = '12px';
    icon.textContent = asset.icon;

    const name = document.createElement('span');
    name.style.fontWeight = '600';
    name.textContent = asset.symbol;

    option.appendChild(icon);
    option.appendChild(name);

    option.addEventListener('click', () => {
      stateManager.setSelectedCollateral(key);
      $('#collateralIcon').textContent = asset.icon;
      $('#collateralName').textContent = asset.symbol;
      $('#collateralModal').classList.add('hidden');
      updateWalletBalance();
      loadStrikeOptions();
    });
    container.appendChild(option);
  }
}

// ─── Strike Selection ───

async function loadStrikeOptions() {
  const container = $('#strikeOptions');
  container.textContent = '';
  const loadingP = document.createElement('p');
  loadingP.className = 'empty-state';
  loadingP.textContent = 'Loading...';
  container.appendChild(loadingP);

  const state = stateManager.getState();
  const { minDurationDays, maxStrikes, maxApr } = state.settings;

  try {
    const options = await service.getStrikeOptions(
      state.selectedCollateral as AssetKey,
      minDurationDays,
      maxStrikes,
      maxApr
    );

    container.textContent = '';

    if (options.length === 0) {
      const emptyP = document.createElement('p');
      emptyP.className = 'empty-state';
      emptyP.textContent = 'No options available. Try adjusting settings.';
      container.appendChild(emptyP);
      return;
    }

    for (const opt of options) {
      const row = document.createElement('div');
      row.className = 'input-row';
      row.style.cursor = 'pointer';
      row.style.marginBottom = '8px';

      const left = document.createElement('div');
      left.style.flex = '1';

      const strikeLine = document.createElement('div');
      strikeLine.style.fontWeight = '600';
      strikeLine.textContent = opt.strikeFormatted;

      const expiryLine = document.createElement('div');
      expiryLine.style.fontSize = '12px';
      expiryLine.style.color = 'var(--text-secondary)';
      expiryLine.textContent = opt.expiryFormatted;

      left.appendChild(strikeLine);
      left.appendChild(expiryLine);

      const right = document.createElement('div');
      right.style.textAlign = 'right';

      const aprLine = document.createElement('div');
      aprLine.style.color = 'var(--success)';
      aprLine.style.fontWeight = '600';
      aprLine.textContent = `${opt.effectiveApr.toFixed(1)}% APR`;

      right.appendChild(aprLine);
      row.appendChild(left);
      row.appendChild(right);

      row.addEventListener('click', () => {
        stateManager.setSelectedStrike(opt.strike);
        stateManager.setSelectedExpiry(opt.expiry);
        $('#strikeModal').classList.add('hidden');
        updateReceiveAmount();
      });
      container.appendChild(row);
    }
  } catch {
    container.textContent = '';
    const errP = document.createElement('p');
    errP.className = 'empty-state';
    errP.textContent = 'Failed to load options. Please try again.';
    container.appendChild(errP);
  }
}

// ─── Review & Submit ───

$('#reviewBtn').addEventListener('click', () => {
  const state = stateManager.getState();
  const deposit = parseFloat(($('#depositAmount') as HTMLInputElement).value);
  const receive = ($('#receiveAmount') as HTMLInputElement).value;
  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];

  if (!asset || !state.selectedStrike || !state.selectedExpiry) return;

  const body = $('#reviewBody');
  body.textContent = '';

  const rows = [
    ['Deposit', `${deposit} ${asset.symbol}`],
    ['Receive', `${receive} USDC`],
    ['Strike', `$${state.selectedStrike.toLocaleString()}`],
    ['Expiry', $('#repayDate').textContent || '--'],
    ['Repayment', $('#repayAmount').textContent || '--'],
    ['Effective APR', $('#effectiveApr').textContent || '--'],
  ];

  const div = document.createElement('div');
  div.style.marginBottom = '16px';

  for (const [label, value] of rows) {
    const row = document.createElement('div');
    row.className = 'payback-row';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.className = label === 'Effective APR' ? 'value green' : 'value';
    valueSpan.textContent = value;

    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    div.appendChild(row);
  }

  const note = document.createElement('p');
  note.style.fontSize = '12px';
  note.style.color = 'var(--text-secondary)';
  note.textContent = 'European option: exercise only at expiry within 1-hour window. No early repayment.';

  body.appendChild(div);
  body.appendChild(note);

  $('#reviewModal').classList.remove('hidden');
});

$('#closeReview').addEventListener('click', () => $('#reviewModal').classList.add('hidden'));

$('#confirmLoanBtn').addEventListener('click', async () => {
  const state = stateManager.getState();
  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];
  if (!asset || !state.selectedStrike || !state.selectedExpiry) return;

  const deposit = parseFloat(($('#depositAmount') as HTMLInputElement).value);
  const collateralAmount = ethers.parseUnits(deposit.toString(), asset.decimals);
  const strike = BigInt(Math.round(state.selectedStrike * 10 ** STRIKE_DECIMALS));
  const receiveStr = ($('#receiveAmount') as HTMLInputElement).value;
  const minSettlement = ethers.parseUnits(receiveStr, 6);

  $('#reviewModal').classList.add('hidden');
  showLoanProgress();

  try {
    updateStep(1, 'active', 'Checking approvals...');
    await service.requestLoan({
      assetKey: state.selectedCollateral as AssetKey,
      collateralAmount,
      strike,
      expiryTimestamp: state.selectedExpiry,
      minSettlementAmount: minSettlement,
      keepOrderOpen: state.settings.keepOrderOpen,
    });

    updateStep(1, 'completed', 'Request submitted');
    updateStep(2, 'active', 'Lenders competing for best rate...');

    showNotification('Loan request submitted!', 'success');
  } catch (err: any) {
    showNotification(err.message || 'Failed to submit loan request', 'error');
    hideLoanProgress();
  }
});

// ─── Loan Progress UI ───

function showLoanProgress() {
  $('#swapInterface').classList.add('hidden');
  $('#loanProgress').classList.remove('hidden');
}

function hideLoanProgress() {
  $('#swapInterface').classList.remove('hidden');
  $('#loanProgress').classList.add('hidden');
}

function updateStep(step: number, status: 'active' | 'completed' | 'pending', desc?: string) {
  const indicator = $(`#step${step}`);
  indicator.className = `step-indicator ${status}`;
  if (status === 'completed') indicator.textContent = '\u2713';
  if (desc) $(`#step${step}Desc`).textContent = desc;
}

$('#dismissFlowBtn').addEventListener('click', hideLoanProgress);

$('#cancelRequestBtn').addEventListener('click', async () => {
  const id = stateManager.getState().activeLoanRequestId;
  if (!id) return;
  if (!confirm('Are you sure you want to cancel this loan request?')) return;

  try {
    await service.cancelLoan(BigInt(id));
    stateManager.removeLoan(id);
    hideLoanProgress();
    showNotification('Loan request cancelled', 'success');
  } catch (err: any) {
    showNotification(err.message || 'Failed to cancel', 'error');
  }
});

// ─── Active Loans Tab ───

function renderActiveLoans() {
  const container = $('#activeLoansContainer');
  const loans = stateManager.getActiveLoans();

  if (loans.length === 0) {
    container.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const p = document.createElement('p');
    p.textContent = 'No active loans found.';
    empty.appendChild(p);
    container.appendChild(empty);
    return;
  }

  container.textContent = '';
  for (const loan of loans) {
    const asset = Object.entries(LOAN_ASSETS).find(
      ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
    );
    const symbol = asset ? asset[1].symbol : '?';
    const decimals = asset ? asset[1].decimals : 18;
    const collateralFormatted = ethers.formatUnits(loan.collateralAmount, decimals);
    const strikeFormatted = (Number(loan.strike) / 10 ** STRIKE_DECIMALS).toLocaleString();
    const expiryDate = new Date(loan.expiryTimestamp * 1000).toLocaleDateString();

    const now = Math.floor(Date.now() / 1000);
    const isInExerciseWindow = now >= loan.expiryTimestamp && now < loan.expiryTimestamp + 3600;
    const isExpired = now >= loan.expiryTimestamp + 3600;

    const card = document.createElement('div');
    card.className = 'loan-card';

    // Header
    const header = document.createElement('div');
    header.className = 'loan-card-header';

    const title = document.createElement('span');
    title.style.fontWeight = '600';
    title.textContent = `${collateralFormatted} ${symbol}`;

    const badge = document.createElement('span');
    if (isInExerciseWindow) {
      badge.className = 'loan-badge action';
      badge.textContent = 'ACTION REQUIRED';
    } else if (isExpired) {
      badge.className = 'loan-badge expired';
      badge.textContent = 'EXPIRED';
    } else {
      badge.className = 'loan-badge active';
      badge.textContent = 'ACTIVE';
    }

    header.appendChild(title);
    header.appendChild(badge);
    card.appendChild(header);

    // Details
    const details: [string, string][] = [
      ['Strike', `$${strikeFormatted}`],
      ['Expiry', expiryDate],
      ['Status', loan.status],
    ];
    for (const [label, value] of details) {
      const row = document.createElement('div');
      row.className = 'loan-detail-row';
      const labelEl = document.createElement('span');
      labelEl.className = 'label';
      labelEl.textContent = label;
      const valueEl = document.createElement('span');
      valueEl.textContent = value;
      row.appendChild(labelEl);
      row.appendChild(valueEl);
      card.appendChild(row);
    }

    // Action buttons
    if (isInExerciseWindow && loan.optionAddress) {
      const exerciseBtn = document.createElement('button');
      exerciseBtn.className = 'btn-primary';
      exerciseBtn.textContent = 'Exercise';
      exerciseBtn.addEventListener('click', () => handleExercise(loan.optionAddress!));

      const swapBtn = document.createElement('button');
      swapBtn.className = 'btn-secondary';
      swapBtn.textContent = 'Swap & Exercise';
      swapBtn.addEventListener('click', () => {
        showNotification('Swap & Exercise coming soon in SDK version', 'info');
      });

      const declineBtn = document.createElement('button');
      declineBtn.className = 'btn-danger';
      declineBtn.textContent = 'Do Not Exercise';
      declineBtn.addEventListener('click', () => handleDoNotExercise(loan.optionAddress!));

      card.appendChild(exerciseBtn);
      card.appendChild(swapBtn);
      card.appendChild(declineBtn);
    }

    container.appendChild(card);
  }
}

async function handleExercise(optionAddress: string) {
  try {
    showNotification('Exercising option...', 'pending');
    await service.exerciseOption(optionAddress);
    showNotification('Option exercised successfully!', 'success');
    renderActiveLoans();
  } catch (err: any) {
    showNotification(err.message || 'Exercise failed', 'error');
  }
}

async function handleDoNotExercise(optionAddress: string) {
  if (!confirm('Forfeit your collateral? You keep the borrowed USDC.')) return;
  try {
    await service.doNotExercise(optionAddress);
    showNotification('Option declined. Collateral released to lender.', 'success');
    renderActiveLoans();
  } catch (err: any) {
    showNotification(err.message || 'Failed', 'error');
  }
}

// ─── History Tab ───

function renderHistory() {
  const container = $('#historyContainer');
  const loans = stateManager.getHistoryLoans();

  if (loans.length === 0) {
    container.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const p = document.createElement('p');
    p.textContent = 'No loan history.';
    empty.appendChild(p);
    container.appendChild(empty);
    return;
  }

  container.textContent = '';
  for (const loan of loans) {
    const card = document.createElement('div');
    card.className = 'loan-card';

    const header = document.createElement('div');
    header.className = 'loan-card-header';

    const title = document.createElement('span');
    title.style.fontWeight = '600';
    title.textContent = `Loan #${loan.quotationId.toString()}`;

    const badge = document.createElement('span');
    badge.className = `loan-badge ${loan.status === 'exercised' ? 'completed' : 'expired'}`;
    badge.textContent = loan.status.toUpperCase();

    header.appendChild(title);
    header.appendChild(badge);
    card.appendChild(header);

    const row = document.createElement('div');
    row.className = 'loan-detail-row';
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = 'Created';
    const value = document.createElement('span');
    value.textContent = new Date(loan.createdAt).toLocaleDateString();
    row.appendChild(label);
    row.appendChild(value);
    card.appendChild(row);

    container.appendChild(card);
  }
}

// ─── Lend Tab ───

function renderLending() {
  const body = $('#lendingBody');
  const opportunities = stateManager.getLendingOpportunities();

  if (opportunities.length === 0) {
    body.textContent = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'empty-state';
    const p = document.createElement('p');
    p.textContent = 'No lending opportunities available.';
    td.appendChild(p);
    tr.appendChild(td);
    body.appendChild(tr);
    return;
  }

  body.textContent = '';
  for (const loan of opportunities) {
    const asset = Object.entries(LOAN_ASSETS).find(
      ([_, a]) => a.collateral.toLowerCase() === loan.collateralToken.toLowerCase()
    );
    const symbol = asset ? asset[1].symbol : '?';
    const decimals = asset ? asset[1].decimals : 18;

    const tr = document.createElement('tr');

    const tdAsset = document.createElement('td');
    tdAsset.textContent = symbol;

    const tdLend = document.createElement('td');
    tdLend.textContent = `${service.formatUsdc(loan.minSettlementAmount)} USDC`;

    const tdReceive = document.createElement('td');
    tdReceive.textContent = `${ethers.formatUnits(loan.collateralAmount, decimals)} ${symbol}`;

    const tdApr = document.createElement('td');
    tdApr.style.color = 'var(--success)';
    tdApr.textContent = '--';

    const tdAction = document.createElement('td');
    const btn = document.createElement('button');
    btn.className = 'offer-card accept-btn';
    btn.textContent = 'Lend';
    btn.addEventListener('click', () => {
      showNotification('Lending flow coming soon', 'info');
    });
    tdAction.appendChild(btn);

    tr.appendChild(tdAsset);
    tr.appendChild(tdLend);
    tr.appendChild(tdReceive);
    tr.appendChild(tdApr);
    tr.appendChild(tdAction);
    body.appendChild(tr);
  }
}

// ─── Settings ───

$('#settingsBtn').addEventListener('click', () => {
  const s = stateManager.getState().settings;
  ($('#settMinDays') as HTMLInputElement).value = s.minDurationDays.toString();
  ($('#settMaxStrikes') as HTMLInputElement).value = s.maxStrikes.toString();
  ($('#settAprSlider') as HTMLInputElement).value = s.maxApr.toString();
  $('#settAprValue').textContent = `${s.maxApr}%`;
  const toggle = $('#settKeepOpen');
  toggle.className = `toggle ${s.keepOrderOpen ? 'on' : ''}`;
  $('#settingsModal').classList.remove('hidden');
});

$('#settAprSlider').addEventListener('input', () => {
  $('#settAprValue').textContent = `${($('#settAprSlider') as HTMLInputElement).value}%`;
});

$('#settKeepOpen').addEventListener('click', () => {
  $('#settKeepOpen').classList.toggle('on');
});

$('#saveSettingsBtn').addEventListener('click', () => {
  stateManager.updateSettings({
    minDurationDays: parseInt(($('#settMinDays') as HTMLInputElement).value),
    maxStrikes: parseInt(($('#settMaxStrikes') as HTMLInputElement).value),
    maxApr: parseInt(($('#settAprSlider') as HTMLInputElement).value),
    keepOrderOpen: $('#settKeepOpen').classList.contains('on'),
  });
  $('#settingsModal').classList.add('hidden');
  showNotification('Settings saved', 'success');
  loadStrikeOptions();
});

// ─── Balances ───

async function updateWalletBalance() {
  const state = stateManager.getState();
  if (!state.connectedAddress) return;

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];
  if (!asset) return;

  try {
    const balance = await service.getBalance(asset.collateral);
    const formatted = ethers.formatUnits(balance, asset.decimals);
    $('#walletBalance').textContent = `Balance: ${parseFloat(formatted).toFixed(6)} ${asset.symbol}`;
  } catch {
    $('#walletBalance').textContent = 'Balance: --';
  }
}

async function updateMmBalance() {
  try {
    const balance = await service.getBalance(USDC_ADDRESS, DEFAULT_MARKET_MAKER);
    const formatted = ethers.formatUnits(balance, 6);
    $('#mmBalance').textContent = `${parseInt(formatted).toLocaleString()} USDC`;
  } catch {
    $('#mmBalance').textContent = 'Error';
  }
}

// ─── Event Listeners (real-time) ───

function setupEventListeners() {
  service.onOfferMade((quotationId, offeror, ...args) => {
    const id = quotationId.toString();
    stateManager.addOffer(id, {
      offeror,
      encryptedAmount: args[0] || '',
      signingKey: args[1] || '',
    });
    renderOffers(id);
  });

  service.onQuotationSettled((quotationId, _requester, _winner, optionAddress) => {
    const id = quotationId.toString();
    stateManager.upsertLoan(id, {
      status: 'active',
      optionAddress,
    });
    updateStep(3, 'completed', 'Offer accepted');
    updateStep(4, 'completed', 'Loan funded!');
    showNotification('Loan funded! Funds sent to your wallet.', 'success');
  });

  service.onQuotationCancelled((quotationId) => {
    stateManager.setLoanStatus(quotationId.toString(), 'cancelled');
  });
}

function renderOffers(quotationId: string) {
  const loan = stateManager.getState().loans.get(quotationId);
  if (!loan || loan.offers.length === 0) return;

  const container = $('#offersContainer');
  container.classList.remove('hidden');
  container.textContent = '';

  const heading = document.createElement('h4');
  heading.style.marginBottom = '8px';
  heading.textContent = 'Offers received:';
  container.appendChild(heading);

  for (const offer of loan.offers) {
    const div = document.createElement('div');
    div.className = 'offer-card';

    const info = document.createElement('div');
    const addrLine = document.createElement('div');
    addrLine.style.fontWeight = '600';
    addrLine.textContent = `${offer.offeror.slice(0, 6)}...${offer.offeror.slice(-4)}`;

    const aprLine = document.createElement('div');
    aprLine.className = 'apr';
    aprLine.textContent = offer.calculatedApr ? `${offer.calculatedApr.toFixed(1)}% APR` : 'Encrypted';

    info.appendChild(addrLine);
    info.appendChild(aprLine);

    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'accept-btn';
    acceptBtn.textContent = 'Accept';
    acceptBtn.addEventListener('click', async () => {
      if (!offer.decryptedAmount || !offer.nonce) {
        showNotification('Cannot accept: offer not yet decrypted', 'error');
        return;
      }
      try {
        await service.acceptOffer(BigInt(quotationId), offer.decryptedAmount, offer.nonce, offer.offeror);
        showNotification('Offer accepted!', 'success');
      } catch (err: any) {
        showNotification(err.message || 'Failed to accept offer', 'error');
      }
    });

    div.appendChild(info);
    div.appendChild(acceptBtn);
    container.appendChild(div);
  }
}

// ─── Notifications ───

function showNotification(message: string, type: 'success' | 'error' | 'pending' | 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  if (type !== 'pending') {
    setTimeout(() => el.remove(), 5000);
  }
}

// ─── Init ───

renderCollateralOptions();
updateMmBalance();

// Auto-refresh MM balance every 60s
setInterval(updateMmBalance, 60000);
