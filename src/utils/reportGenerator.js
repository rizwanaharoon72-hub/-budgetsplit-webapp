/**
 * reportGenerator.js
 * Handles PDF export for monthly BudgetSplit reports using jsPDF and jspdf-autotable.
 */

import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';

// Ensure the plugin is registered on jsPDF prototype
try {
  applyPlugin(jsPDF);
} catch (e) {
  console.warn('jspdf-autotable plugin already applied or error:', e);
}

/**
 * Format a number as PKR currency string.
 */
function formatPKR(amount) {
  const val = Math.round(Number(amount) || 0);
  return `${val.toLocaleString('en-PK')} PKR`;
}

/**
 * Get a human-readable label for a category.
 */
function getCategoryLabel(category) {
  const map = {
    need: 'Need',
    needs: 'Need',
    want: 'Want',
    wants: 'Want',
    saving: 'Saving',
    savings: 'Saving',
  };
  return map[category?.toLowerCase()] || category || 'Unknown';
}

/**
 * Format a date string as readable.
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate and download PDF Monthly Budget Report.
 *
 * @param {object} opts
 * @param {object} opts.profile  - User profile (name, monthlyIncome, current_monthly_income)
 * @param {string} opts.month    - YYYY-MM string
 * @param {Array}  opts.expenses - List of expense objects
 * @param {object} opts.totals   - Spending totals {needsSpent, wantsSpent, savingsSpent, totalSpent}
 * @param {object} opts.limits   - Budget limits {needs, wants, savings, needs_ratio, wants_ratio, savings_ratio}
 */
export function generatePDFReport({ profile, month, expenses, totals, limits }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const monthLabel = month
    ? new Date(month + '-01').toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
    : 'Unknown Month';
  const userName = profile?.name || 'User';
  const monthlyIncome = Number(profile?.current_monthly_income || profile?.monthlyIncome) || 0;
  const needsRatio = limits?.needs_ratio ?? 50;
  const wantsRatio = limits?.wants_ratio ?? 30;
  const savingsRatio = limits?.savings_ratio ?? 20;

  // ── HEADER BANNER ──
  doc.setFillColor(15, 118, 110); // teal-700 brand color
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BudgetSplit', marginLeft, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Financial Report', marginLeft, 22);
  doc.text(`${needsRatio}/${wantsRatio}/${savingsRatio} Budget Rule`, marginLeft, 28);

  doc.setTextColor(200, 255, 250);
  doc.setFontSize(10);
  doc.text(`Report Period: ${monthLabel}`, pageWidth - marginRight, 14, { align: 'right' });
  doc.text(`Prepared for: ${userName}`, pageWidth - marginRight, 22, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, pageWidth - marginRight, 28, { align: 'right' });

  let yPos = 42;

  // ── INCOME & BUDGET SUMMARY ──
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Income & Budget Summary', marginLeft, yPos);
  yPos += 6;

  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 6;

  const totalSpent = totals?.totalSpent || 0;
  const totalBudget = (limits?.needs || 0) + (limits?.wants || 0) + (limits?.savings || 0);
  const totalRemaining = totalBudget - totalSpent;

  const summaryData = [
    ['Monthly Income', formatPKR(monthlyIncome)],
    [`Needs Budget (${needsRatio}%)`, formatPKR(limits?.needs || 0)],
    [`Wants Budget (${wantsRatio}%)`, formatPKR(limits?.wants || 0)],
    [`Savings Budget (${savingsRatio}%)`, formatPKR(limits?.savings || 0)],
    ['Total Budget', formatPKR(totalBudget)],
    ['Total Spent This Month', formatPKR(totalSpent)],
    ['Total Remaining', formatPKR(totalRemaining)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: summaryData,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.6 },
      1: { cellWidth: contentWidth * 0.4, halign: 'right', fontStyle: 'bold' },
    },
  });

  yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos + 40) + 10;

  // ── CATEGORY BREAKDOWN ──
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Category Breakdown', marginLeft, yPos);
  yPos += 6;

  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  yPos += 3;

  const needsSpent = totals?.needsSpent || 0;
  const wantsSpent = totals?.wantsSpent || 0;
  const savingsSpent = totals?.savingsSpent || 0;
  const needsLimit = limits?.needs || 0;
  const wantsLimit = limits?.wants || 0;
  const savingsLimit = limits?.savings || 0;

  const categoryData = [
    [
      `Needs (${needsRatio}%)`,
      formatPKR(needsSpent),
      formatPKR(needsLimit),
      formatPKR(needsLimit - needsSpent),
      needsLimit > 0 ? `${((needsSpent / needsLimit) * 100).toFixed(1)}%` : '0%',
    ],
    [
      `Wants (${wantsRatio}%)`,
      formatPKR(wantsSpent),
      formatPKR(wantsLimit),
      formatPKR(wantsLimit - wantsSpent),
      wantsLimit > 0 ? `${((wantsSpent / wantsLimit) * 100).toFixed(1)}%` : '0%',
    ],
    [
      `Savings (${savingsRatio}%)`,
      formatPKR(savingsSpent),
      formatPKR(savingsLimit),
      formatPKR(savingsLimit - savingsSpent),
      savingsLimit > 0 ? `${((savingsSpent / savingsLimit) * 100).toFixed(1)}%` : '0%',
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Spent', 'Limit', 'Remaining', 'Used %']],
    body: categoryData,
    theme: 'grid',
    margin: { left: marginLeft, right: marginRight },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center', fontStyle: 'bold' },
    },
  });

  yPos = (doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos + 30) + 10;

  // ── EXPENSE DETAIL TABLE ──
  if (expenses && expenses.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Expenses for ${monthLabel} (${expenses.length} total)`, marginLeft, yPos);
    yPos += 6;

    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 3;

    const expenseRows = expenses.map((exp, idx) => [
      idx + 1,
      exp.title || exp.note || 'Expense',
      getCategoryLabel(exp.category),
      formatDate(exp.date || exp.expense_date),
      formatPKR(exp.amount),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Description', 'Category', 'Date', 'Amount']],
      body: expenseRows,
      theme: 'striped',
      margin: { left: marginLeft, right: marginRight },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [238, 242, 255] },
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 65 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      },
    });
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No expenses recorded for this month.', marginLeft, yPos + 8);
  }

  // ── FOOTER ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `BudgetSplit Financial Report  •  ${monthLabel}  •  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // ── SAVE / DOWNLOAD ──
  const fileName = `BudgetSplit_Report_${month || 'report'}.pdf`;
  doc.save(fileName);
  return fileName;
}
