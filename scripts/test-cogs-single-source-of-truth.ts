import { AccountingEngine } from '../src/features/accounting/services/AccountingEngine';
import { Sale, InvoiceItem } from '../src/types';

async function runTest() {
  console.log('🧪 Starting COGS Single Source of Truth Verification Test...');

  // Mock Sale object
  const sale: Sale = {
    id: 'SALE-TEST-001',
    SaleID: 'INV-2026-001',
    date: new Date().toISOString(),
    customerId: 'CUST-001',
    customerName: 'عميل تجريبي',
    items: [
      { productId: 'PROD-A', qty: 10, price: 50 },
      { productId: 'PROD-B', qty: 5, price: 100 }
    ],
    finalTotal: 1000,
    paymentStatus: 'Cash',
    status: 'Posted'
  };

  const items: InvoiceItem[] = sale.items;

  // Explicit FIFO costResult (different from default database catalog price)
  const explicitCostResult = {
    totalCost: 432.50,
    itemCosts: {
      'PROD-A': 132.50,
      'PROD-B': 300.00
    }
  };

  console.log('1. Generating sales entry with explicit FIFO costResult (Single Source of Truth)...');
  const entry = await AccountingEngine.generateSalesEntry(sale, items, explicitCostResult);

  console.log(`Generated Journal Entry ID: ${entry.id}`);
  console.log(`Total Amount: ${entry.TotalAmount}`);
  console.log(`Lines count: ${entry.lines.length}`);

  // Find COGS line matching expected cost
  const matchingDebitLine = entry.lines.find(l => l.debit === explicitCostResult.totalCost);
  if (!matchingDebitLine) {
    throw new Error(`COGS line with cost ${explicitCostResult.totalCost} not found in entry lines! Lines: ${JSON.stringify(entry.lines)}`);
  }
  console.log(`✅ Verified COGS debit amount exactly matches FIFO totalCost: ${matchingDebitLine.debit}`);

  // Verify Debit = Credit balance across all lines
  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
  console.log(`Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Unbalanced entry! Debit (${totalDebit}) !== Credit (${totalCredit})`);
  }
  console.log('✅ Verified Journal Entry is perfectly balanced (Debit = Credit).');

  console.log('2. Testing return entry with explicit FIFO costResult...');
  const returnEntry = await AccountingEngine.generateReturnEntry(sale, items, explicitCostResult);
  const returnCogsCreditLine = returnEntry.lines.find(l => l.credit === explicitCostResult.totalCost);
  if (!returnCogsCreditLine) {
    throw new Error(`Return entry COGS credit line with cost ${explicitCostResult.totalCost} not found!`);
  }
  console.log(`✅ Verified Return Entry correctly credits COGS with FIFO cost: ${returnCogsCreditLine.credit}`);

  console.log('🎉 ALL COGS SINGLE SOURCE OF TRUTH TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ COGS Test Failed:', err);
  process.exit(1);
});
