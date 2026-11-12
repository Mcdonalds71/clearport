/* ==========================================================================
   CLEARPORT — INTERACTIVE MVP ENGINE & WORKBENCH CONTROLLER
   Powers:
   1. Hero Live Pre-Arrival PAAR & Commercial Invoice X-Ray (index.html)
   2. Interactive Demurrage & Duty Penalty Calculator (index.html & pricing.html)
   3. Enterprise Auth & Tenant Provisioning -> Routes to Live Dashboard (signup.html / login.html)
   4. Full Working MVP Customs Audit Dashboard (dashboard.html)
   ========================================================================== */

(function () {
  'use strict';

  /* 1. Mobile Navigation Toggle */
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', function () {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* 2. Hero Interactive PAAR & Commercial Invoice X-Ray Workbench */
  const heroConsignments = {
    apapa: {
      title: 'Consignment #CP-8841 — Rotary PET Bottling & Capping Line',
      meta: 'FORM M: MF20260049182 · B/L: MAEU94810244 · PORT: APAPA TERMINAL E · CIF: $148,500.00',
      badgeText: '1 HS-CODE QUERY RISK FLAGGED',
      badgeClass: 'flagged',
      alertText: 'Line 02 declared under HS 8479.89.00.00 (20% Duty) instead of ECOWAS CET Industrial Packaging Machinery HS 8422.30.00.00 (5% Duty). Prevents ₦34.3M overpayment & 25% NCS Demand Notice.',
      dutySaved: '₦42,886,500 ($27,848)',
      auditTime: '38.4 seconds (14 pages)',
      rows: [
        {
          line: '01',
          desc: 'Stainless Conveying Track Assembly (304 Grade, 18m)',
          invHs: '8428.39.00.00',
          cetHs: '8428.39.00.00',
          status: 'MATCH · 5% DUTY',
          isError: false,
          permit: 'SONCAP PC-2 Verified'
        },
        {
          line: '02',
          desc: 'Automatic High-Speed Rotary Bottle Filling & Capping Unit',
          invHs: '8479.89.00.00 (20%)',
          cetHs: '8422.30.00.00 (5%)',
          status: 'MISMATCH · RECLASSIFY',
          isError: true,
          permit: 'Form M Line 02 Amend Ready'
        },
        {
          line: '03',
          desc: 'PLC Control Cabinet & Servo Frequency Inverters (380V)',
          invHs: '8537.10.00.00',
          cetHs: '8537.10.00.00',
          status: 'MATCH · 10% DUTY',
          isError: false,
          permit: 'Weight & Net FOB Reconciled'
        }
      ]
    },
    tincan: {
      title: 'Consignment #CP-8849 — Cold-Rolled Non-Alloy Steel Coils (1.2mm)',
      meta: 'FORM M: MF20260051904 · B/L: MSCU77291038 · PORT: TIN CAN ISLAND TICT · CIF: $212,000.00',
      badgeText: 'WEIGHT & TARIFF DISCREPANCY',
      badgeClass: 'flagged',
      alertText: 'Bill of Lading gross weight (84,600 kg) exceeds Commercial Invoice packing weight (81,200 kg) by 4.18%. Line 01 width classification requires 7209.17.00.00.',
      dutySaved: '₦29,410,000 ($19,097)',
      auditTime: '41.2 seconds (22 pages)',
      rows: [
        {
          line: '01',
          desc: 'Cold-Rolled Steel Coils, Width 1,250mm, Thickness 1.2mm',
          invHs: '7209.25.00.00 (10%)',
          cetHs: '7209.17.00.00 (5%)',
          status: 'COIL GAUGE MISMATCH',
          isError: true,
          permit: 'SONCAP SC-99418 Active'
        },
        {
          line: '02',
          desc: 'Galvanized Slit Steel Strips in Bundles (Width 420mm)',
          invHs: '7212.30.00.00',
          cetHs: '7212.30.00.00',
          status: 'MATCH · 10% DUTY',
          isError: false,
          permit: 'Mill Test Cert Verified'
        },
        {
          line: '03',
          desc: 'Anti-Corrosion VCI Packaging Kraft Interleaving Paper',
          invHs: '4811.90.00.00',
          cetHs: '4811.90.00.00',
          status: 'MATCH · 5% DUTY',
          isError: false,
          permit: 'FOB Valuation Matches PAAR'
        }
      ]
    },
    mmia: {
      title: 'Consignment #CP-8854 — Active Pharmaceutical Excipients & Blister Foil',
      meta: 'FORM M: MF20260053011 · AWB: 020-88419204 · PORT: MMIA CARGO LAGOS · CIF: $94,200.00',
      badgeText: 'NAFDAC & VAT EXEMPTION AUDIT',
      badgeClass: 'flagged',
      alertText: 'Line 01 Microcrystalline Cellulose BP qualifies for 0% VAT Pharmaceutical Raw Material exemption under HS 3912.90.00.00, but broker draft applied 7.5% standard VAT.',
      dutySaved: '₦18,640,200 ($12,104)',
      auditTime: '29.6 seconds (9 pages)',
      rows: [
        {
          line: '01',
          desc: 'Microcrystalline Cellulose BP/USP Grade (Pharma Excipient)',
          invHs: '3912.90.00.00 (+7.5% VAT)',
          cetHs: '3912.90.00.00 (0% VAT Exempt)',
          status: 'APPLY PHARMA VAT EXEMPT',
          isError: true,
          permit: 'NAFDAC Permit #NP-2026-4412'
        },
        {
          line: '02',
          desc: 'Cold-Forming Alu-Alu Blister Foil Rolls (25 Micron)',
          invHs: '7607.19.90.00',
          cetHs: '7607.19.90.00',
          status: 'MATCH · 5% DUTY',
          isError: false,
          permit: 'COA & Batch Numbers Matched'
        },
        {
          line: '03',
          desc: 'HPMC Empty Hard Vegetable Capsules Size 0 (2.4M Units)',
          invHs: '9602.00.00.00',
          cetHs: '9602.00.00.00',
          status: 'MATCH · 5% DUTY',
          isError: false,
          permit: 'NAFDAC CRIA Cleared'
        }
      ]
    }
  };

  const wbTabs = document.querySelectorAll('[data-wb-tab]');
  const wbTitle = document.getElementById('wbDocTitle');
  const wbMeta = document.getElementById('wbDocMeta');
  const wbBadge = document.getElementById('wbStatusBadge');
  const wbTableBody = document.getElementById('wbTableBody');
  const wbAlertText = document.getElementById('wbAlertText');
  const wbFixBtn = document.getElementById('wbAutoFixBtn');
  const wbDutySaved = document.getElementById('wbDutySaved');
  const wbAuditTime = document.getElementById('wbAuditTime');

  let activeHeroKey = 'apapa';

  function renderHeroWorkbench(key, resolved) {
    const item = heroConsignments[key];
    if (!item || !wbTitle) return;

    wbTitle.textContent = item.title;
    wbMeta.textContent = item.meta;
    wbDutySaved.textContent = item.dutySaved;
    wbAuditTime.textContent = item.auditTime;

    if (resolved) {
      wbBadge.textContent = 'PAAR READY · 0 QUERIES';
      wbBadge.className = 'wb-status-badge cleared';
      wbAlertText.textContent =
        'All 10-digit ECOWAS CET HS codes, Form M weights, and regulatory permits reconciled. Ready for one-click NICIS II / B\'Odogwu PAAR XML export.';
      if (wbFixBtn) {
        wbFixBtn.textContent = '✓ HS Code Corrected — Open Full Dashboard';
        wbFixBtn.className = 'btn-pill btn-pill-outline-dark';
      }
    } else {
      wbBadge.textContent = item.badgeText;
      wbBadge.className = 'wb-status-badge ' + item.badgeClass;
      wbAlertText.textContent = item.alertText;
      if (wbFixBtn) {
        wbFixBtn.textContent = 'Apply AI HS-Code Reclassification →';
        wbFixBtn.className = 'btn-pill btn-pill-primary';
      }
    }

    wbTableBody.innerHTML = item.rows
      .map(function (r) {
        if (r.isError && !resolved) {
          return (
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.08);">' +
            '<td style="padding:12px 10px;" class="mono-code">' + r.line + '</td>' +
            '<td style="padding:12px 10px;"><strong>' + r.desc + '</strong><div style="font-size:0.7rem;color:#94A3B8;margin-top:2px;">' + r.permit + '</div></td>' +
            '<td style="padding:12px 10px;"><span class="hs-bad">' + r.invHs + '</span><span class="hs-good">→ ' + r.cetHs + '</span></td>' +
            '<td style="padding:12px 10px;"><span style="font-family:var(--font-mono);font-size:0.68rem;padding:3px 8px;background:rgba(225,29,72,0.22);color:#FDA4AF;border-radius:4px;">' + r.status + '</span></td>' +
            '</tr>'
          );
        }
        const finalHs = r.isError ? r.cetHs : r.invHs;
        return (
          '<tr style="border-bottom:1px solid rgba(255,255,255,0.08);">' +
          '<td style="padding:12px 10px;" class="mono-code">' + r.line + '</td>' +
          '<td style="padding:12px 10px;"><strong>' + r.desc + '</strong><div style="font-size:0.7rem;color:#94A3B8;margin-top:2px;">' + r.permit + '</div></td>' +
          '<td style="padding:12px 10px;"><span class="hs-good">' + finalHs + '</span></td>' +
          '<td style="padding:12px 10px;"><span style="font-family:var(--font-mono);font-size:0.68rem;padding:3px 8px;background:rgba(16,185,129,0.18);color:#6EE7B7;border-radius:4px;">VERIFIED · READY</span></td>' +
          '</tr>'
        );
      })
      .join('');
  }

  if (wbTabs.length > 0) {
    renderHeroWorkbench(activeHeroKey, false);
    wbTabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        wbTabs.forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        activeHeroKey = btn.getAttribute('data-wb-tab');
        renderHeroWorkbench(activeHeroKey, false);
      });
    });

    if (wbFixBtn) {
      wbFixBtn.addEventListener('click', function () {
        if (wbBadge.classList.contains('cleared')) {
          window.location.href = 'dashboard.html';
        } else {
          renderHeroWorkbench(activeHeroKey, true);
        }
      });
    }
  }

  /* 3. Interactive Container Demurrage & Duty Penalty Calculator */
  const calcContainersInput = document.getElementById('calcContainers');
  const calcValueInput = document.getElementById('calcCifValue');
  const calcContainersLabel = document.getElementById('calcContainersVal');
  const calcValueLabel = document.getElementById('calcCifValueVal');
  const calcSavedUsd = document.getElementById('calcSavedUsd');
  const calcSavedNgn = document.getElementById('calcSavedNgn');
  const calcHoursSaved = document.getElementById('calcHoursSaved');

  function updateCalculator() {
    if (!calcContainersInput || !calcValueInput) return;
    const containers = parseInt(calcContainersInput.value, 10) || 25;
    const avgCif = parseInt(calcValueInput.value, 10) || 85000;

    if (calcContainersLabel) calcContainersLabel.textContent = containers + ' TEUs / mo';
    if (calcValueLabel) calcValueLabel.textContent = '$' + avgCif.toLocaleString();

    // Realistic demurrage + 25% DN query avoidance calculation
    // Assume ~14% of manual declarations hit a query costing 9 days demurrage ($260/day) + 3.5% penalty exposure
    const demurrageAvoided = Math.round(containers * 0.18 * 9 * 260);
    const penaltyAvoided = Math.round(containers * 0.12 * (avgCif * 0.045));
    const totalMonthlyUsd = demurrageAvoided + penaltyAvoided;
    const totalMonthlyNgn = totalMonthlyUsd * 1540;
    const hoursSaved = Math.round(containers * 4.2);

    if (calcSavedUsd) calcSavedUsd.textContent = '$' + totalMonthlyUsd.toLocaleString() + ' / mo';
    if (calcSavedNgn) calcSavedNgn.textContent = '≈ ₦' + totalMonthlyNgn.toLocaleString() + ' saved monthly in avoided NCS Demand Notices & terminal demurrage';
    if (calcHoursSaved) calcHoursSaved.textContent = hoursSaved + ' broker hours / mo';
  }

  if (calcContainersInput && calcValueInput) {
    calcContainersInput.addEventListener('input', updateCalculator);
    calcValueInput.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  /* 4. Enterprise Signup / Login -> Provisioning -> Redirect to Live Dashboard */
  const authForm = document.getElementById('clearportAuthForm');
  const ssoButtons = document.querySelectorAll('[data-sso-login]');
  const authFormContainer = document.getElementById('authFormContainer');
  const authProvisioningBox = document.getElementById('authProvisioningBox');
  const authStepText = document.getElementById('authStepText');

  function triggerDashboardProvisioning(emailOrProvider) {
    if (emailOrProvider) {
      try {
        sessionStorage.setItem('clearport_user', emailOrProvider);
      } catch (e) {}
    }
    if (authFormContainer && authProvisioningBox) {
      authFormContainer.style.display = 'none';
      authProvisioningBox.style.display = 'block';
      setTimeout(function () {
        if (authStepText) authStepText.textContent = '2/3 Loading ECOWAS CET 2022–2027 Tariff Index & CBN FX Rates...';
      }, 550);
      setTimeout(function () {
        if (authStepText) authStepText.textContent = '3/3 Opening Clearport Live PAAR & HS-Code Audit Workbench...';
      }, 1100);
      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 1650);
    } else {
      window.location.href = 'dashboard.html';
    }
  }

  if (authForm) {
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = document.getElementById('authEmail');
      const emailVal = emailInput && emailInput.value ? emailInput.value : 'customs.desk@gmtnigeria.com';
      triggerDashboardProvisioning(emailVal);
    });
  }

  if (ssoButtons.length > 0) {
    ssoButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const provider = btn.getAttribute('data-sso-login');
        triggerDashboardProvisioning(provider);
      });
    });
  }

  /* 5. Live Product Dashboard (dashboard.html) Controller */
  const dashTableBody = document.getElementById('dashConsignmentRows');
  if (dashTableBody) {
    const dashboardData = [
      {
        id: 'CP-8841',
        importer: 'GMT Nigeria Limited (RC 333700)',
        port: 'Apapa Terminal E',
        formM: 'MF20260049182',
        bl: 'MAEU94810244',
        cifUsd: '$148,500',
        itemsCount: 18,
        status: 'FLAGGED',
        confidence: '99.2%',
        issueTitle: 'Line 02 HS-Code Over-Tariff & Missing SONCAP PC Reference',
        declaredHs: '8479.89.00.00 (20% Import Duty + 7.5% VAT)',
        recommendedHs: '8422.30.00.00 (5% Industrial Packaging Machinery Duty)',
        weightCheck: 'Invoice Net: 14,280 kg · B/L Gross: 15,100 kg (MATCH)',
        dutyPayableBefore: '₦64,191,600',
        dutyPayableAfter: '₦21,305,100',
        savingsNgn: '₦42,886,500',
        fxRate: '₦1,540.00 / USD (CBN Customs Window)',
        permitNote: 'SONCAP Product Certificate #PC-2026-88219 verified against Form M.'
      },
      {
        id: 'CP-8849',
        importer: 'Sifax Shipping Company Ltd (RC 470456)',
        port: 'Tin Can Island (TICT)',
        formM: 'MF20260051904',
        bl: 'MSCU77291038',
        cifUsd: '$212,000',
        itemsCount: 9,
        status: 'FLAGGED',
        confidence: '98.7%',
        issueTitle: 'Gross Weight Variance (+4.18%) & Coil Gauge Subheading Mismatch',
        declaredHs: '7209.25.00.00 (10% Duty — Flat-Rolled >3mm)',
        recommendedHs: '7209.17.00.00 (5% Duty — Cold-Rolled Coils 0.5mm–1.5mm)',
        weightCheck: 'Invoice Gross: 81,200 kg vs B/L Gross: 84,600 kg (AMEND PACKING LIST)',
        dutyPayableBefore: '₦71,488,000',
        dutyPayableAfter: '₦42,078,000',
        savingsNgn: '₦29,410,000',
        fxRate: '₦1,540.00 / USD (CBN Customs Window)',
        permitNote: 'Mill Test Certificate #MTC-4491 confirms 1.2mm cold-rolled thickness.'
      },
      {
        id: 'CP-8854',
        importer: 'Red Star Express Plc (RC 200303)',
        port: 'MMIA Air Cargo Lagos',
        formM: 'MF20260053011',
        bl: 'AWB-020-88419204',
        cifUsd: '$94,200',
        itemsCount: 12,
        status: 'FLAGGED',
        confidence: '99.6%',
        issueTitle: 'Unclaimed Pharmaceutical Raw Material 0% VAT Statutory Exemption',
        declaredHs: '3912.90.00.00 (5% Duty + 7.5% Standard VAT)',
        recommendedHs: '3912.90.00.00 (5% Duty + 0% VAT Pharma Excipient Schedule)',
        weightCheck: 'AWB Chargeable Weight: 3,420 kg · Packing List: 3,420 kg (MATCH)',
        dutyPayableBefore: '₦31,098,400',
        dutyPayableAfter: '₦12,458,200',
        savingsNgn: '₦18,640,200',
        fxRate: '₦1,540.00 / USD (CBN Customs Window)',
        permitNote: 'NAFDAC Permit #NP-2026-4412 & CRIA Clean Report verified.'
      },
      {
        id: 'CP-8837',
        importer: 'Fortune Global Shipping Ltd (RC 662247)',
        port: 'Onne Port FLT-B',
        formM: 'MF20260047810',
        bl: 'CMAU55190281',
        cifUsd: '$310,400',
        itemsCount: 27,
        status: 'CLEARED',
        confidence: '99.8%',
        issueTitle: 'All 27 Line Items Reconciled Across Form M, B/L & Commercial Invoice',
        declaredHs: '8413.70.00.00 (5% Duty — Submersible Centrifugal Pumps)',
        recommendedHs: '8413.70.00.00 (Verified Match — 0 Discrepancies)',
        weightCheck: 'Invoice Gross: 42,800 kg · B/L Gross: 42,800 kg (MATCH)',
        dutyPayableBefore: '₦63,912,400',
        dutyPayableAfter: '₦63,912,400',
        savingsNgn: '₦0 (Pre-Cleared)',
        fxRate: '₦1,540.00 / USD (CBN Customs Window)',
        permitNote: 'SONCAP & DPR Marine Equipment Exemption validated. PAAR XML exported.'
      }
    ];

    let selectedId = 'CP-8841';
    let filterMode = 'ALL';

    const kpiProcessed = document.getElementById('kpiTotalProcessed');
    const kpiFlagged = document.getElementById('kpiFlaggedCount');
    const kpiSaved = document.getElementById('kpiTotalSaved');
    const inspId = document.getElementById('inspConsignmentId');
    const inspImporter = document.getElementById('inspImporter');
    const inspMeta = document.getElementById('inspMeta');
    const inspStatus = document.getElementById('inspStatusBadge');
    const inspIssue = document.getElementById('inspIssueTitle');
    const inspDeclared = document.getElementById('inspDeclaredHs');
    const inspRecommended = document.getElementById('inspRecommendedHs');
    const inspWeight = document.getElementById('inspWeightCheck');
    const inspDutyBefore = document.getElementById('inspDutyBefore');
    const inspDutyAfter = document.getElementById('inspDutyAfter');
    const inspSavings = document.getElementById('inspSavings');
    const inspPermit = document.getElementById('inspPermitNote');
    const btnApproveFix = document.getElementById('btnApproveHsFix');
    const btnRunNewScan = document.getElementById('btnRunSampleScan');
    const btnExportPaar = document.getElementById('btnExportPaarXml');
    const toastBanner = document.getElementById('dashToastBanner');

    function showToast(msg) {
      if (!toastBanner) return;
      toastBanner.textContent = msg;
      toastBanner.style.display = 'block';
      setTimeout(function () {
        toastBanner.style.display = 'none';
      }, 4000);
    }

    function renderQueue() {
      const filtered = dashboardData.filter(function (d) {
        if (filterMode === 'FLAGGED') return d.status === 'FLAGGED';
        if (filterMode === 'CLEARED') return d.status === 'CLEARED';
        return true;
      });

      const flaggedTotal = dashboardData.filter(function (d) {
        return d.status === 'FLAGGED';
      }).length;
      if (kpiFlagged) kpiFlagged.textContent = flaggedTotal + ' Active Queries';

      dashTableBody.innerHTML = filtered
        .map(function (d) {
          const isSel = d.id === selectedId ? 'selected' : '';
          const badgeHtml =
            d.status === 'FLAGGED'
              ? '<span style="font-family:var(--font-mono);font-size:0.68rem;font-weight:700;padding:2px 7px;background:var(--status-crimson-soft);color:var(--status-crimson);border:1px solid rgba(185,28,28,0.28);">QUERY RISK</span>'
              : '<span style="font-family:var(--font-mono);font-size:0.68rem;font-weight:700;padding:2px 7px;background:var(--status-emerald-soft);color:var(--status-emerald);border:1px solid rgba(19,111,66,0.28);">PAAR READY</span>';

          return (
            '<tr class="clickable-row ' + isSel + '" data-row-id="' + d.id + '">' +
            '<td class="mono-code"><strong>' + d.id + '</strong><div style="font-size:0.68rem;color:var(--text-muted);">' + d.formM + '</div></td>' +
            '<td><strong>' + d.importer + '</strong><div style="font-size:0.72rem;color:var(--text-muted);">' + d.port + ' · B/L ' + d.bl + '</div></td>' +
            '<td class="mono-code">' + d.cifUsd + '<div style="font-size:0.68rem;color:var(--text-muted);">' + d.itemsCount + ' lines</div></td>' +
            '<td>' + badgeHtml + '</td>' +
            '</tr>'
          );
        })
        .join('');

      document.querySelectorAll('[data-row-id]').forEach(function (row) {
        row.addEventListener('click', function () {
          selectedId = row.getAttribute('data-row-id');
          renderQueue();
          renderInspector();
        });
      });
    }

    function renderInspector() {
      const item =
        dashboardData.find(function (d) {
          return d.id === selectedId;
        }) || dashboardData[0];
      if (!item || !inspId) return;

      inspId.textContent = item.id + ' — Pre-Arrival Audit Sheet';
      inspImporter.textContent = item.importer;
      inspMeta.textContent = 'FORM M: ' + item.formM + ' · B/L: ' + item.bl + ' · PORT: ' + item.port;
      inspIssue.textContent = item.issueTitle;
      inspDeclared.textContent = item.declaredHs;
      inspRecommended.textContent = item.recommendedHs;
      inspWeight.textContent = item.weightCheck;
      inspDutyBefore.textContent = item.dutyPayableBefore;
      inspDutyAfter.textContent = item.dutyPayableAfter;
      inspSavings.textContent = item.savingsNgn;
      inspPermit.textContent = item.permitNote;

      if (item.status === 'FLAGGED') {
        inspStatus.textContent = 'DISCREPANCY DETECTED (' + item.confidence + ' AI CONFIDENCE)';
        inspStatus.style.background = 'var(--status-crimson-soft)';
        inspStatus.style.color = 'var(--status-crimson)';
        if (btnApproveFix) {
          btnApproveFix.textContent = 'Approve AI HS-Code Reclassification & Clear Query';
          btnApproveFix.disabled = false;
          btnApproveFix.className = 'btn btn-primary';
        }
      } else {
        inspStatus.textContent = 'PAAR CLEARED · READY FOR NICIS II FILING';
        inspStatus.style.background = 'var(--status-emerald-soft)';
        inspStatus.style.color = 'var(--status-emerald)';
        if (btnApproveFix) {
          btnApproveFix.textContent = '✓ Reclassification Applied — Consignment Cleared';
          btnApproveFix.disabled = true;
          btnApproveFix.className = 'btn btn-outline';
        }
      }
    }

    if (btnApproveFix) {
      btnApproveFix.addEventListener('click', function () {
        const item = dashboardData.find(function (d) {
          return d.id === selectedId;
        });
        if (item && item.status === 'FLAGGED') {
          item.status = 'CLEARED';
          item.declaredHs = item.recommendedHs;
          item.issueTitle = 'Resolved: ECOWAS CET 10-Digit HS Code & Weight Reconciled';
          renderQueue();
          renderInspector();
          showToast(
            '✓ Consignment ' +
              item.id +
              ' reclassified to ECOWAS CET standard. PAAR XML & Duty Assessment ready for filing.'
          );
        }
      });
    }

    if (btnRunNewScan) {
      btnRunNewScan.addEventListener('click', function () {
        btnRunNewScan.disabled = true;
        btnRunNewScan.textContent = 'Scanning Invoice via Azure Document Intelligence...';
        setTimeout(function () {
          const newId = 'CP-' + Math.floor(8860 + Math.random() * 35);
          const newRecord = {
            id: newId,
            importer: 'Brawal Shipping (Nigeria) Ltd (RC 43768)',
            port: 'Kirikiri Lighter Terminal (KLT)',
            formM: 'MF20260058412',
            bl: 'HLCU91827364',
            cifUsd: '$176,800',
            itemsCount: 15,
            status: 'FLAGGED',
            confidence: '99.4%',
            issueTitle: 'Line 04 Solar Hybrid Inverter Classified Under Generator Tariff (20%)',
            declaredHs: '8502.11.00.00 (20% Duty — Diesel Generating Sets)',
            recommendedHs: '8504.40.00.00 (5% Duty — Static Photovoltaic Inverters)',
            weightCheck: 'Invoice Gross: 24,500 kg · B/L Gross: 24,500 kg (MATCH)',
            dutyPayableBefore: '₦74,840,000',
            dutyPayableAfter: '₦34,012,000',
            savingsNgn: '₦40,828,000',
            fxRate: '₦1,540.00 / USD (CBN Customs Window)',
            permitNote: 'SONCAP & NEMSA Solar Import Compliance Certificate verified.'
          };
          dashboardData.unshift(newRecord);
          selectedId = newId;
          if (kpiProcessed) kpiProcessed.textContent = '1,429 Consignments';
          renderQueue();
          renderInspector();
          btnRunNewScan.disabled = false;
          btnRunNewScan.textContent = '+ Upload & Scan Sample Consignment';
          showToast(
            'New Consignment ' +
              newId +
              ' scanned in 3.2s — 1 HS-Code over-tariff discrepancy flagged (₦40.8M duty savings).'
          );
        }, 900);
      });
    }

    if (btnExportPaar) {
      btnExportPaar.addEventListener('click', function () {
        const item =
          dashboardData.find(function (d) {
            return d.id === selectedId;
          }) || dashboardData[0];
        const reportContent = [
          '====================================================================',
          'CLEARPORT TECHNOLOGIES LTD (RC 1984712) — PRE-ARRIVAL PAAR AUDIT SHEET',
          '====================================================================',
          'Consignment ID   : ' + item.id,
          'Importer on File : ' + item.importer,
          'Port of Discharge: ' + item.port,
          'Form M Number    : ' + item.formM,
          'Bill of Lading   : ' + item.bl,
          'CIF Valuation    : ' + item.cifUsd + ' (' + item.fxRate + ')',
          'Audit Status     : ' + item.status,
          '--------------------------------------------------------------------',
          'TARIFF & VALUATION FINDINGS:',
          'Finding          : ' + item.issueTitle,
          'Declared HS Code : ' + item.declaredHs,
          'ECOWAS CET Code  : ' + item.recommendedHs,
          'Weight Check     : ' + item.weightCheck,
          'Regulatory Permit: ' + item.permitNote,
          '--------------------------------------------------------------------',
          'DUTY ASSESSMENT SUMMARY:',
          'Un-audited Duty  : ' + item.dutyPayableBefore,
          'Clearport Duty   : ' + item.dutyPayableAfter,
          'Net Duty Saved   : ' + item.savingsNgn,
          '====================================================================',
          'Generated by Clearport AI Tariff Engine (Azure AI Document Intelligence)'
        ].join('\n');

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.id + '-PAAR-Audit-Sheet.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded ' + item.id + '-PAAR-Audit-Sheet.txt for NICIS II / B\'Odogwu filing.');
      });
    }

    // Filter tabs in dashboard sidebar/header
    document.querySelectorAll('[data-dash-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-dash-filter]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        filterMode = btn.getAttribute('data-dash-filter');
        renderQueue();
      });
    });

    renderQueue();
    renderInspector();
  }
})();

