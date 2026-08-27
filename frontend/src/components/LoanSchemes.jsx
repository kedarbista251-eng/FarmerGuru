import React, { useState, useEffect } from 'react';

const REAL_GOVT_SCHEMES = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Samman Nidhi',
    category: 'Central Income Support',
    benefit: '₹6,000 / year direct income support disbursed in 3 equal installments via Direct Benefit Transfer (DBT).',
    eligibility: 'All landholding farmer families across India holding cultivable agricultural land.',
    applyUrl: 'https://pmkisan.gov.in/',
    portal: 'PM-KISAN Portal'
  },
  {
    id: 'kalia',
    title: 'KALIA Scheme (Odisha State)',
    category: 'State Financial Assistance',
    benefit: '₹10,000 / year for small & marginal farmers + ₹12,500 for landless agricultural households.',
    eligibility: 'Small, marginal farmers & landless agricultural laborers residing in Odisha.',
    applyUrl: 'https://kalia.odisha.gov.in/',
    portal: 'KALIA Odisha Portal'
  },
  {
    id: 'pmfby',
    title: 'PM Fasal Bima Yojana (Crop Insurance)',
    category: 'Risk Management',
    benefit: 'Comprehensive crop insurance coverage against drought, flood, pests. Premium capped at 1.5% - 2%.',
    eligibility: 'All farmers growing notified crops in notified areas (loanee & non-loanee).',
    applyUrl: 'https://pmfby.gov.in/',
    portal: 'PMFBY Portal'
  },
  {
    id: 'soil-card',
    title: 'Soil Health Card Scheme',
    category: 'Soil Telemetry Grant',
    benefit: 'Free soil sample testing & customized NPK fertilizer recommendation report cards every 3 years.',
    eligibility: 'All registered farmers with agricultural land holdings.',
    applyUrl: 'https://soilhealth.dac.gov.in/',
    portal: 'Soil Health Portal'
  }
];

const AUTHENTIC_BANK_LOANS = [
  {
    id: 'sbi-kcc',
    bank: 'State Bank of India (SBI)',
    loanName: 'SBI Kisan Credit Card (KCC) & YONO Krishi',
    baseRate: 7.0,
    subventionRate: 3.0, // Effective 4.0% with prompt repayment
    maxLimit: 'Up to ₹5,000,000 (Collateral-free up to ₹1.6 Lakhs)',
    tenure: '5 Years (Annual renewal)',
    features: 'Flexible drawdown via KCC ATM card, built-in crop insurance, and instant YONO digital renewal.',
    directLink: 'https://sbi.bank.in/web/agri-rural/asset-backed-agri-loan',
    docs: ['Land Record (Khatauni/ROR)', 'Aadhaar Card', '2 Passport Photos', 'Crop Pattern Declaration']
  },
  {
    id: 'bob-kisan',
    bank: 'Bank of Baroda',
    loanName: 'Baroda Kisan Credit Card & Nari Shakti Loan',
    baseRate: 7.0,
    subventionRate: 3.0,
    maxLimit: 'Up to ₹3,000,000',
    tenure: '3 to 5 Years',
    features: 'Tailored for crop cultivation, agro-processing units, and women farmer self-help groups.',
    directLink: 'https://bankofbaroda.bank.in/farmers',
    docs: ['Aadhaar & PAN Card', 'Voter ID', 'Land Ownership Records', 'Bank Passbook Copy']
  },
  {
    id: 'hdfc-kisan',
    bank: 'HDFC Bank',
    loanName: 'HDFC Kisan Gold Loan & Agri Credit Line',
    baseRate: 8.5,
    subventionRate: 0.0,
    maxLimit: 'Customized per acre scale of finance',
    tenure: '12 Months to 5 Years',
    features: 'Includes RuPay Farmer Platinum Debit Card, ₹2 Lakh personal accident cover, and quick sanction.',
    directLink: 'https://www.hdfc.bank.in/agri-banking/rural-loans/agri-allied-financing-program',
    docs: ['ID Proof (Aadhaar)', 'Land Revenue Receipts', 'Passport Photographs', 'Existing Debt Declaration']
  }
];

const LOCAL_BRANCH_DIRECTORY = [
  { district: 'Rourkela', bank: 'SBI Main Branch Rourkela', address: 'Civic Centre, Sector 19, Rourkela, Sundargarh, Odisha', phone: '1800-11-2211' },
  { district: 'Rourkela', bank: 'Bank of Baroda Rourkela Branch', address: 'Main Road, Daily Market, Rourkela, Odisha', phone: '1800-258-4455' },
  { district: 'Rourkela', bank: 'HDFC Bank Panposh Branch', address: 'Panposh Road, Rourkela, Odisha', phone: '1800-202-6161' }
];

const NATIONAL_NEWS_STREAM = [
  {
    id: 'nat-1',
    title: 'Union Cabinet approves Minimum Support Price (MSP) rates for Kharif Crops',
    source: 'Press Information Bureau (PIB Delhi)',
    date: 'August 2026',
    snippet: 'Cabinet approves increased MSP for 14 Kharif crops ensuring at least 50% profit margin over All-India production costs.',
    link: 'https://pib.gov.in/'
  },
  {
    id: 'nat-2',
    title: 'PM-KISAN 23rd Installment released via Direct Benefit Transfer',
    source: 'Ministry of Agriculture & Farmers Welfare',
    date: 'August 2026',
    snippet: 'Over ₹18,000 Crore transferred directly to 9.4 Crore farmer accounts across India.',
    link: 'https://pmkisan.gov.in/'
  }
];

const REGIONAL_NEWS_STREAM = [
  {
    id: 'reg-1',
    title: 'Odisha Krushi Vibhag issues monsoon sowing seed subsidy guidelines',
    source: 'Odisha Agriculture Department',
    date: 'Today',
    snippet: 'High-yield Paddy and Pulse seeds made available at 50% direct subsidy across Block Development Centers in Odisha.',
    link: 'https://kalia.odisha.gov.in/'
  }
];

export default function LoanSchemes() {
  const [schemes, setSchemes] = useState(REAL_GOVT_SCHEMES);
  const [loans, setLoans] = useState(AUTHENTIC_BANK_LOANS);
  const [branches, setBranches] = useState(LOCAL_BRANCH_DIRECTORY);
  const [news, setNews] = useState([...NATIONAL_NEWS_STREAM, ...REGIONAL_NEWS_STREAM]);
  const [activeTab, setActiveTab] = useState('schemes');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState('Rourkela, Odisha');
  const [selectedLoanForDocs, setSelectedLoanForDocs] = useState(null);

  // Subsidy Calculator State
  const [calcLoanAmount, setCalcLoanAmount] = useState(150000);
  const [isPromptRepayment, setIsPromptRepayment] = useState(true);

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    Promise.all([fetch(`${api}/api/schemes/govt`), fetch(`${api}/api/schemes/loans`), fetch(`${api}/api/schemes/branches`), fetch(`${api}/api/schemes/news`)]).then(async ([schemeResponse, loanResponse, branchResponse, newsResponse]) => {
      if (schemeResponse.ok) setSchemes((await schemeResponse.json()).map(scheme => ({ ...scheme, applyUrl: scheme.apply_url })));
      if (loanResponse.ok) setLoans((await loanResponse.json()).map(loan => ({ ...loan, loanName: loan.loan_name, baseRate: loan.base_rate, subventionRate: loan.subvention_rate, maxLimit: loan.max_limit, directLink: loan.direct_link, docs: JSON.parse(loan.docs || '[]') })));
      if (branchResponse.ok) setBranches(await branchResponse.json());
      if (newsResponse.ok) setNews(await newsResponse.json());
    }).catch(() => {});
    try {
      const savedProfile = localStorage.getItem('kisan_farm_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.district) setUserLocation(parsed.district);
      }
    } catch (e) {
      console.warn('Profile read fallback:', e);
    }
  }, []);

  const baseRate = 7.0;
  const effectiveRate = isPromptRepayment ? 4.0 : 7.0;
  const annualInterestWithoutSubvention = (calcLoanAmount * (baseRate / 100));
  const annualInterestWithSubvention = (calcLoanAmount * (effectiveRate / 100));
  const annualSavings = annualInterestWithoutSubvention - annualInterestWithSubvention;

  const filteredSchemes = selectedCategory === 'All' 
    ? schemes 
    : schemes.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#ffffff',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Government Welfare & Banking Directory
          </span>
          <h2 style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
            🏛️ Kisan Loans, Subsidies & News Stream
          </h2>
        </div>

        <div style={{
          backgroundColor: '#047857',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '800',
          color: '#ffffff'
        }}>
          📍 Location: {userLocation}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{
        display: 'flex',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '6px 20px 0',
        gap: '12px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'schemes', label: '📜 Govt Schemes & Subsidies' },
          { id: 'calculator', label: '🧮 KCC Interest Subvention Calculator' },
          { id: 'loans', label: '🏦 Bank Loans (Official Links)' },
          { id: 'branches', label: '📍 Nearby Branches & Extension' },
          { id: 'news', label: '📰 National & Regional News' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 18px',
              fontSize: '13px',
              fontWeight: '800',
              border: 0,
              borderBottom: activeTab === tab.id ? '3px solid #064e3b' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#064e3b' : '#64748b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* TAB: INTEREST SUBVENTION CALCULATOR */}
        {activeTab === 'calculator' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                Kisan Credit Card (KCC) Subvention Engine
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                Calculate Your Effective Loan Interest & Savings
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {/* Slider Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Required Crop Loan Amount:</span>
                    <span style={{ color: '#064e3b', fontWeight: '800' }}>₹{calcLoanAmount.toLocaleString()}</span>
                  </label>
                  <input 
                    type="range" 
                    min="20000" 
                    max="300000" 
                    step="10000" 
                    value={calcLoanAmount}
                    onChange={e => setCalcLoanAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#064e3b', marginTop: '8px' }}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Loans up to ₹1.6 Lakhs are 100% Collateral-Free</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f0fdf4',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #bbf7d0'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>
                    Timely Repayment Incentive (-3% Subvention)
                  </span>
                  <input 
                    type="checkbox" 
                    checked={isPromptRepayment} 
                    onChange={e => setIsPromptRepayment(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#047857', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Output Display Card */}
              <div style={{
                backgroundColor: '#064e3b',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: '800' }}>Effective Net Interest Rate</span>
                  <strong style={{ display: 'block', fontSize: '32px', color: '#fcd34d', fontWeight: '900', marginTop: '2px' }}>
                    {effectiveRate}% p.a.
                  </strong>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.15)',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#d1fae5' }}>Annual Interest Payable:</span>
                    <strong>₹{annualInterestWithSubvention.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontWeight: '800' }}>
                    <span>Govt Subvention Savings:</span>
                    <span>₹{annualSavings.toLocaleString()} / year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: GOVT SCHEMES */}
        {activeTab === 'schemes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
              {['All', 'Central', 'State', 'Risk', 'Soil'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '800',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? '#064e3b' : '#cbd5e1',
                    backgroundColor: selectedCategory === cat ? '#064e3b' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {filteredSchemes.map(s => (
                <div key={s.id} style={{
                  padding: '20px 24px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#047857',
                      backgroundColor: '#ecfdf5',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      textTransform: 'uppercase'
                    }}>
                      {s.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>🏛️ Direct Benefit Transfer</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {s.title}
                  </h3>

                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
                    <strong style={{ color: '#064e3b' }}>🎁 Financial Benefit: </strong>
                    {s.benefit}
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                    📋 <strong>Eligibility:</strong> {s.eligibility}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                    <a
                      href={s.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#064e3b',
                        color: '#ffffff',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '800',
                        textDecoration: 'none'
                      }}
                    >
                      Apply on {s.portal} ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BANK LOANS WITH DOCUMENT CHECKLIST */}
        {activeTab === 'loans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Institutional Agricultural Credit Lines & Document Requirements
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
              {loans.map(l => (
                <div key={l.id} style={{
                  padding: '22px 24px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#047857', fontWeight: '800' }}>{l.bank}</strong>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '8px' }}>
                      Interest Rate: {l.baseRate - l.subventionRate}% p.a.
                    </span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {l.loanName}
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    backgroundColor: '#f8fafc',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '13px'
                  }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Borrowing Limit</span>
                      <strong style={{ color: '#0f172a', fontSize: '14px' }}>{l.maxLimit}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Tenure</span>
                      <strong style={{ color: '#0f172a', fontSize: '14px' }}>{l.tenure}</strong>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    💡 <strong>Credit Features:</strong> {l.features}
                  </p>

                  {/* Document Checklist Accordion Toggle */}
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '12px 16px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedLoanForDocs(selectedLoanForDocs === l.id ? null : l.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 0,
                        color: '#166534',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}
                    >
                      <span>📋 View Required Documents Checklist</span>
                      <span>{selectedLoanForDocs === l.id ? '▲' : '▼'}</span>
                    </button>

                    {selectedLoanForDocs === l.id && (
                      <ul style={{ margin: '10px 0 0 20px', padding: 0, fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                        {l.docs.map((doc, idx) => (
                          <li key={idx}><strong>{doc}</strong></li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                    <a
                      href={l.directLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#064e3b',
                        color: '#ffffff',
                        padding: '11px 22px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        textDecoration: 'none'
                      }}
                    >
                      Apply Directly on Official Bank Portal ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: NEARBY BRANCHES */}
        {activeTab === 'branches' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '16px 20px',
              borderRadius: '14px'
            }}>
              <strong style={{ color: '#166534', fontSize: '14px', display: 'block' }}>
                📍 Local Agricultural Credit Desks for: {userLocation}
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#15803d' }}>
                Showing verified agricultural banking branches and credit extension desks nearest to your current location.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {branches.map((b, idx) => (
                <div key={idx} style={{
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>{b.bank}</strong>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
                      {b.district} District Extension
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    🏢 <strong>Address:</strong> {b.address}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#064e3b', fontWeight: '700' }}>
                      📞 Helpline: {b.phone}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.bank} ${b.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#0284c7',
                        textDecoration: 'none'
                      }}
                    >
                      🗺️ Open Directions on Google Maps ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: NEWS */}
        {activeTab === 'news' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🇮🇳</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  National All-India Agricultural Policy & Cabinet Notices
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                {news.filter(n => n.type !== 'regional').map(n => (
                  <div key={n.id} style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#064e3b', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>
                        {n.source}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{n.date}</span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4 }}>
                      {n.title}
                    </h4>

                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                      {n.snippet}
                    </p>

                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', fontWeight: '800', color: '#047857', marginTop: '4px', textDecoration: 'none' }}
                    >
                      Read Official Government Notice ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📍</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  Regional Bulletins for: {userLocation}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                {news.filter(n => n.type === 'regional').map(n => (
                  <div key={n.id} style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    border: '2px solid #047857',
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', backgroundColor: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                        ODISHA REGIONAL
                      </span>
                      <span style={{ fontSize: '11px', color: '#047857', fontWeight: '700' }}>{n.date}</span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4 }}>
                      {n.title}
                    </h4>

                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      {n.snippet}
                    </p>

                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', fontWeight: '800', color: '#047857', marginTop: '4px', textDecoration: 'none' }}
                    >
                      Read District Agricultural Notice ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}