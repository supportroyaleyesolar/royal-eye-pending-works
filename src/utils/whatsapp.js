// ─── Royal Eye Solar Power – 1-Click WhatsApp Delivery & Marketing ───
// Formats customer quotations, PM Surya Ghar subsidy estimates & live workflow progress

export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

export function calcSubsidyDetails(capacityStr) {
  const kw = parseFloat(capacityStr) || 3;
  let subsidy = 78000;
  let approxCost = 195000;
  let monthlyUnits = 360;
  let monthlySavings = 2500;

  if (kw <= 1) {
    subsidy = 30000;
    approxCost = 75000;
    monthlyUnits = 120;
    monthlySavings = 850;
  } else if (kw <= 2) {
    subsidy = 60000;
    approxCost = 145000;
    monthlyUnits = 240;
    monthlySavings = 1700;
  } else if (kw >= 3) {
    subsidy = 78000;
    approxCost = Math.round(kw * 65000);
    monthlyUnits = Math.round(kw * 120);
    monthlySavings = Math.round(kw * 850);
  }

  const netInvestment = Math.max(0, approxCost - subsidy);
  return {
    capacityKw: kw,
    approxCost,
    subsidy,
    netInvestment,
    monthlyUnits,
    monthlySavings,
    annualSavings: monthlySavings * 12,
  };
}

/**
 * 1-Click WhatsApp Solar Quotation & Marketing Pitch Delivery
 */
export function generateQuotationPitch(customer) {
  const name = customer.name || 'Valued Customer';
  const capacity = customer.systemCapacity || '3 kW';
  const phone = customer.phone || '';
  const location = customer.address || customer.district || 'Kerala';
  const sub = calcSubsidyDetails(capacity);

  const text = 
`☀️ *ROYAL EYE SOLAR POWER – ROOFTOP QUOTATION* ☀️
━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear *${name}*,
Greetings from *Royal Eye Solar Power (P) Ltd, Thrissur*.

Thank you for your interest in powering your premises with clean solar energy! Here is your customized Solar Proposal under the *PM Surya Ghar: Muft Bijli Yojana*:

📍 *Site Location:* ${location}
⚡ *Proposed System:* *${sub.capacityKw} kW On-Grid Solar System*
🔋 *Monthly Clean Generation:* ~${sub.monthlyUnits} Units
💰 *Est. KSEB Monthly Savings:* ~₹${sub.monthlySavings.toLocaleString('en-IN')} / month
📈 *Est. Annual Savings:* ~₹${sub.annualSavings.toLocaleString('en-IN')} / year

💵 *FINANCIAL BREAKDOWN:*
• Gross Project Cost: ~₹${sub.approxCost.toLocaleString('en-IN')}
• *PM Surya Ghar Central Subsidy:* *-₹${sub.subsidy.toLocaleString('en-IN')}* (Direct DBT to bank)
━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Net Effective Investment: ~₹${sub.netInvestment.toLocaleString('en-IN')}* only!
*(Zero-interest EMI & Solar Bank Loan facility available)*

🛡️ *WARRANTIES & GUARANTEE:*
✔️ 25 Years Tier-1 Solar Panel Performance Warranty
✔️ 5–10 Years Inverter Replacement Warranty
✔️ KSEB Feasibility, Net Metering & MNRE Portal clearance handled end-to-end by Royal Eye

Would you like us to schedule a *Free Rooftop Feasibility & Shadow Analysis Survey* this week?

📞 *Direct Helpline:* +91 9876543210 / 0487-2345678
🌐 *Office:* TC 14/672, Guruvayur Road, Thrissur, Kerala
⚡ *License:* KSEB-SLR-2024-1872
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Royal Eye Solar – Powering Kerala with Clean Energy_`;

  return { text, phone };
}

/**
 * 1-Click WhatsApp Live Installation & Stage Update
 */
export function generateProgressUpdateMessage(customer) {
  const name = customer.name || 'Valued Customer';
  const id = customer.id || '';
  const stage = customer.workflowStage || customer.stage || 'In Progress';
  const progress = customer.progress ?? 40;
  const status = customer.status || 'Active';
  const consumerNo = customer.electricityConsumerNo || 'Registered';

  const text =
`☀️ *ROYAL EYE SOLAR – WORK PROGRESS UPDATE* ☀️
━━━━━━━━━━━━━━━━━━━━━━━━━━
Dear *${name}*,

Here is the current live status for your Solar Installation Project:

📋 *Project ID:* ${id}
⚡ *KSEB Consumer No:* ${consumerNo}
📊 *Current Status:* *${status.toUpperCase()}* (${progress}% Completed)
📍 *Active Milestone:* *${stage}*

${progress >= 100 
  ? `🎉 *Congratulations!* Your solar system is fully energized and connected to the KSEB grid. Happy clean power generation!`
  : `Our technical team is actively coordinating the next steps. We will keep you notified once this phase concludes.`}

If you have any questions or need documentation assistance, feel free to reply directly to this message.

📞 *Customer Support:* +91 9876543210
🏢 *Royal Eye Solar Power*, Thrissur`;

  return { text, phone: customer.phone || '' };
}

/**
 * Open WhatsApp Web or App
 */
export function openWhatsApp(phone, text) {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
