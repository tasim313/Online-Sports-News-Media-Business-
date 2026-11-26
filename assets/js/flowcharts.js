/* ==========================================================================
   SportsScope — flowcharts.js
   18 Mermaid business workflow diagrams, rendered per section.
   ========================================================================== */
(function () {
  'use strict';
  const SB = window.SB;

  const FLOW = {
    'business-lifecycle': [
      { id: 'fc-lifecycle', title: 'Complete Business Lifecycle', def: `
flowchart TD
  A([Start: Idea]) --> B[Market Research & Concept]
  B --> C{Validated?}
  C -- No --> B
  C -- Yes --> D[Build MVP & Launch]
  D --> E[Startup: Register, Hire, SEO]
  E --> F[Growth: Traffic + AdSense + Sponsors]
  F --> G{Profitable & Scalable?}
  G -- No --> F
  G -- Yes --> H[Expansion: Streaming, Subscriptions, New Markets]
  H --> I[Maturity: Multi-channel, Governance]
  I --> J{Exit or Continue?}
  J -- Continue --> I
  J -- Exit --> K([Exit: Acquisition / Buyout / MBO])
  classDef start fill:#2dd4bf,stroke:#0b1020,color:#06121f;
  classDef dec fill:#fbbf24,stroke:#0b1020,color:#06121f;
  classDef end fill:#a78bfa,stroke:#0b1020,color:#06121f;
  class A start; class C,G,J dec; class K end;` }
    ],

    'operational-workflow': [
      { id: 'fc-editorial', title: 'Editorial Workflow', def: `
flowchart LR
  A([News Discovery]) --> B[Verification]
  B --> C{Verified?}
  C -- No --> A
  C -- Yes --> D[Research & Assignment]
  D --> E[Writing]
  E --> F[Fact-Checking]
  F --> G[Editing]
  G --> H[SEO Optimization]
  H --> I{Editor Approval}
  I -- Reject --> E
  I -- Approve --> J[Publish]
  J --> K[Social Distribution]
  K --> L[Performance Monitoring]
  L --> M([Archive / Update])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class C,I dec; class M end;` },
      { id: 'fc-adsense', title: 'Google AdSense Revenue Workflow', def: `
flowchart TD
  A([Publish Quality Content]) --> B[Grow Organic Traffic]
  B --> C[Apply / Get Approved for AdSense]
  C --> D{Approved?}
  D -- No --> Z[Fix Policy / Reapply]
  Z --> C
  D -- Yes --> E[Place Ad Units + Auto Ads]
  E --> F[Monitor Page RPM, CTR, Fill]
  F --> G{Invalid Traffic?}
  G -- Yes --> H[Stop & Investigate Sources]
  H --> E
  G -- No --> I[Optimize Placements]
  I --> J[Monthly Revenue = PV/1000 × PageRPM]
  J --> K([Report & Reinvest])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class D,G dec; class K end;` },
      { id: 'fc-advertising', title: 'Advertising Revenue Workflow', def: `
flowchart LR
  A([Advertiser Discovery]) --> B[Lead Generation]
  B --> C[Proposal & Rate Card]
  C --> D[Negotiation]
  D --> E{Deal?}
  E -- No --> B
  E -- Yes --> F[Contract]
  F --> G[Campaign Creation]
  G --> H[Ad Publishing]
  H --> I[Monitoring]
  I --> J[Reporting]
  J --> K[Payment]
  K --> L[Renewal]
  L --> M([Account Growth])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class E dec; class M end;` },
      { id: 'fc-sponsorship', title: 'Sponsorship Workflow', def: `
flowchart TD
  A([Sponsor Identification]) --> B[Sponsorship Proposal]
  B --> C[Negotiation]
  C --> D{Agreement?}
  D -- No --> B
  D -- Yes --> E[Campaign Execution]
  E --> F[Deliverable Verification]
  F --> G[Performance Report]
  G --> H{Satisfied?}
  H -- No --> I[Remediate / Adjust]
  I --> F
  H -- Yes --> J[Renewal]
  J --> K([Long-term Partnership])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class D,H dec; class K end;` },
      { id: 'fc-streaming', title: 'Live Streaming Workflow', def: `
flowchart TD
  A([Event Identification]) --> B{Rights Available?}
  B -- No --> Z[Do Not Stream - Stop]
  B -- Yes --> C[Partnership / License]
  C --> D[Production Planning]
  D --> E[Equipment Prep]
  E --> F[Testing]
  F --> G[Go Live]
  G --> H[Moderation]
  H --> I[Recording]
  I --> J[Editing]
  J --> K[Distribution]
  K --> L[Monetization]
  L --> M[Performance Analysis]
  M --> N([Archive / Learn])
  classDef dec fill:#fbbf24,color:#06121f; classDef stop fill:#f87171,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class B,H dec; class Z stop; class N end;` },
      { id: 'fc-subscription', title: 'Subscription Workflow', def: `
flowchart LR
  A([Visitor]) --> B[Free Content]
  B --> C{Engaged?}
  C -- No --> B
  C -- Yes --> D[Premium Offer]
  D --> E[Subscribe & Pay]
  E --> F[Access Premium]
  F --> G[Monthly Billing]
  G --> H{Churn Risk?}
  H -- Yes --> I[Retention Campaign]
  I --> F
  H -- No --> J[Renewal]
  J --> K([Recurring Revenue])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class C,H dec; class K end;` },
      { id: 'fc-financial', title: 'Financial Management Workflow', def: `
flowchart TD
  A([Revenue Recording]) --> B[Expense Recording]
  B --> C[Invoice Management]
  C --> D[Payment Verification]
  D --> E[Payroll]
  E --> F[Tax Calculation]
  F --> G[Monthly Reconciliation]
  G --> H{Balanced?}
  H -- No --> I[Investigate Discrepancy]
  I --> G
  H -- Yes --> J[Financial Reporting]
  J --> K([Investor / Management Dashboard])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class H dec; class K end;` },
      { id: 'fc-investor', title: 'Investor Funding Workflow', def: `
flowchart LR
  A([Investor Identification]) --> B[Pitch]
  B --> C[Due Diligence]
  C --> D[Valuation]
  D --> E[Negotiation]
  E --> F{Sign?}
  F -- No --> B
  F -- Yes --> G[Shareholder Agreement]
  G --> H[Investment Receipt]
  H --> I[Equity Allocation]
  I --> J[Reporting]
  J --> K[Future Funding or Exit]
  K --> L([Liquidity Event])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class F dec; class L end;` },
      { id: 'fc-profit', title: 'Profit Distribution Workflow', def: `
flowchart TD
  A([Net Profit]) --> B{Profitable?}
  B -- No --> C[Reinvest / No Distribution]
  C --> A
  B -- Yes --> D[Maintain Reserve]
  D --> E[Reinvest for Growth]
  E --> F[Distributable Profit]
  F --> G{Board Decision}
  G -- Reinvest --> E
  G -- Dividend --> H[Pay per Equity %]
  H --> I([Shareholder Returns])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class B,G dec; class I end;` },
      { id: 'fc-breakeven', title: 'Break-Even Workflow', def: `
flowchart LR
  A([Fixed Costs]) --> B[Variable Cost Ratio]
  B --> C[Contribution Margin]
  C --> D[BE Revenue = Fixed / CM]
  D --> E{BE Reached?}
  E -- No --> F[Increase Traffic / Sponsors / Subs]
  F --> D
  E -- Yes --> G[Profit Mode]
  G --> H([Reinvest / Distribute])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class E dec; class H end;` },
      { id: 'fc-risk', title: 'Risk Management Workflow', def: `
flowchart TD
  A([Identify Risk]) --> B[Assess Likelihood × Impact]
  B --> C{High?}
  C -- No --> D[Monitor]
  D --> A
  C -- Yes --> E[Mitigate / Avoid / Transfer]
  E --> F[Assign Owner]
  F --> G[Track KPI]
  G --> H{Resolved?}
  H -- No --> E
  H -- Yes --> I([Close & Document])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class C,H dec; class I end;` },
      { id: 'fc-expansion', title: 'Business Expansion Workflow', def: `
flowchart LR
  A([Stable Cash Flow]) --> B{Reserve OK?}
  B -- No --> A
  B -- Yes --> C[New Market / Stream]
  C --> D[Validate Demand]
  D --> E{Validated?}
  E -- No --> A
  E -- Yes --> F[Allocate Budget]
  F --> G[Launch]
  G --> H[Measure]
  H --> I([Scale or Stop])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class B,E dec; class I end;` },
      { id: 'fc-acquisition', title: 'Business Acquisition Workflow', def: `
flowchart TD
  A([Growth & Profit]) --> B[Prepare Company]
  B --> C[Identify Acquirers]
  C --> D[Outreach / NDA]
  D --> E[Due Diligence]
  E --> F[Valuation & Offer]
  F --> G{Negotiate}
  G -- No --> C
  G -- Yes --> H[Definitive Agreement]
  H --> I[Close & Transfer]
  I --> J([Founder/Investor Payout])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class G dec; class J end;` },
      { id: 'fc-exit', title: 'Founder & Investor Exit Workflow', def: `
flowchart LR
  A([Exit Trigger]) --> B{Exit Type}
  B -- Buyout --> C[Negotiate Buyback]
  B -- Acquisition --> D[Strategic Sale]
  B -- MBO --> E[Management Buyout]
  B -- Merger --> F[Combine Entities]
  B -- IPO --> G[Public Listing]
  C --> H[Legal & Tax]
  D --> H
  E --> H
  F --> H
  G --> H
  H --> I[Distribute Proceeds per Cap Table]
  I --> J([Liquidity Achieved])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class B dec; class J end;` }
    ]
  };

  // Sections that host the lifecycle/ownership/startup/registration diagrams
  const SECTION_EXTRA = {
    'business-overview': [
      { id: 'fc-startup', title: 'Startup Planning', def: `
flowchart TD
  A([Idea]) --> B[Research Niche]
  B --> C[Branding & Domain]
  C --> D[Business Plan]
  D --> E[Budget & Funding]
  E --> F{Funded?}
  F -- No --> E
  F -- Yes --> G([Register & Build])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class F dec; class G end;` },
      { id: 'fc-registration', title: 'Business Registration', def: `
flowchart LR
  A([Name & Structure]) --> B[Trademark Check]
  B --> C[Joint Stock / RJSC Filing]
  C --> D[TIN & VAT Registration]
  D --> E[Bank Account]
  E --> F[Licenses & Policies]
  F --> G([Operate Legally])
  classDef end fill:#a78bfa,color:#06121f; class G end;` }
    ],
    'founder-ownership': [
      { id: 'fc-equity', title: 'Ownership & Equity Structure', def: `
flowchart TD
  A([Founders]) --> B[Initial Equity Split]
  B --> C[ESOP Pool]
  C --> D{Angel Round?}
  D -- Yes --> E[New Shares Issued - Dilution]
  E --> F[Cap Table Updates]
  D -- No --> F
  F --> G{Seed / Series A?}
  G -- Yes --> E
  G -- No --> H([Steady Ownership])
  classDef dec fill:#fbbf24,color:#06121f; classDef end fill:#a78bfa,color:#06121f;
  class D,G dec; class H end;` }
    ],
    'implementation-roadmap': [
      { id: 'fc-roadmap', title: 'Implementation Roadmap Flow', def: `
flowchart LR
  A([Days 1-30: Research & Brand]) --> B[Days 31-60: Build & Content]
  B --> C[Days 61-90: Launch & SEO]
  C --> D[Mo 4-6: AdSense & Sponsors]
  D --> E[Mo 7-12: Diversify & Video]
  E --> F[Year 2: Streaming & Subs]
  F --> G([Year 3-5: Expand & Fundraise])
  classDef end fill:#a78bfa,color:#06121f; class G end;` }
    ]
  };

  function allFor(section) {
    return (FLOW[section] || []).concat(SECTION_EXTRA[section] || []);
  }

  function renderFor(section) {
    if (typeof mermaid === 'undefined') return;
    const host = document.getElementById('flows-' + section);
    if (!host) return;
    const items = allFor(section);
    if (!items.length) return;
    if (host.dataset.rendered === '1') {
      // re-render (theme may have changed)
      host.innerHTML = '';
    }
    let html = '';
    items.forEach(it => {
      html += '<div class="card mt16"><h3>' + it.title + '</h3><div class="flow-wrap"><div class="mermaid">' +
              it.def.replace(/classDef[^;]*;/g, '').trim() + '</div></div></div>';
    });
    host.innerHTML = html;
    host.dataset.rendered = '1';
    try {
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose',
        flowchart: { curve: 'basis', useMaxWidth: true }, themeVariables: {
          fontFamily: 'Segoe UI, sans-serif', primaryColor: '#1c2749', primaryTextColor: '#e8ecf7',
          primaryBorderColor: '#2dd4bf', lineColor: '#6b78a0', secondaryColor: '#161f3d',
          tertiaryColor: '#121a33', fontSize: '14px' } });
      mermaid.init(undefined, host.querySelectorAll('.mermaid'));
    } catch (e) { /* ignore */ }
  }

  SB.flows = { renderFor, allFor };
})();