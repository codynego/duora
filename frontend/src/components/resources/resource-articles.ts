export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  readTime: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
  faqs: Array<{ question: string; answer: string }>;
};

export const resourceArticles: ResourceArticle[] = [
  {
    slug: 'how-to-track-business-expenses',
    title: 'How to track business expenses for a small business in Nigeria',
    description: 'A practical way for Nigerian small-business owners to record expenses, separate business spending, and understand where money goes each month.',
    eyebrow: 'Expense tracking guide',
    readTime: '7 min read',
    intro: 'If you only check your business spending when cash feels tight, you are seeing the result after the useful decision window has passed. A simple expense-tracking habit gives you a running view of what the business is paying for, which costs are changing, and which records still need attention.',
    sections: [
      { heading: 'Start with one record for every business payment', paragraphs: ['Record the date, amount, description, category, and account used. If the payment relates to a customer or supplier, add that relationship too. The goal is not to create perfect accounting records on day one; it is to make each movement explainable later.'], bullets: ['Date the money left the business', 'What the payment was for', 'Amount and currency', 'Cash, bank, or other account used', 'Supplier, category, or note that adds context'] },
      { heading: 'Separate business spending from personal spending', paragraphs: ['Mixing personal and business payments makes every report harder to trust. Use a separate business account where possible. When a personal payment does happen, record it clearly instead of silently leaving it out. That keeps the cash position honest and makes the exception visible.'] },
      { heading: 'Review expenses by month, not only one receipt at a time', paragraphs: ['A single expense is rarely the main story. Compare categories and suppliers over a month or quarter. Look for repeated increases, missing records, duplicate entries, and bills that are due soon. This is where a list of transactions becomes a decision tool.'] },
      { heading: 'A simple weekly routine', paragraphs: ['Choose one short time each week to update records, attach notes, and review anything unusual. For a small shop, that might be after the busiest sales day. For a service business, it might be Friday afternoon. Consistency matters more than the exact day.'] },
    ],
    faqs: [
      { question: 'What is the easiest way to track small-business expenses?', answer: 'Use one consistent record for every payment with the date, amount, description, category, and account. A spreadsheet can work at first; a financial workspace becomes more useful as transactions and balances grow.' },
      { question: 'Should I track expenses daily?', answer: 'Daily is ideal when there are many payments, but a weekly routine can work for a smaller business. The important thing is to avoid letting receipts and payment messages pile up until details are forgotten.' },
    ],
  },
  {
    slug: 'how-to-track-customer-debts',
    title: 'How to track customer debts and overdue payments in Nigeria',
    description: 'Learn how to keep a clear list of customer balances, due dates, partial payments, and overdue follow-ups for a Nigerian small business.',
    eyebrow: 'Customer balances guide',
    readTime: '7 min read',
    intro: 'A sale is not the same as cash received. If customers buy on credit, your business needs a simple way to see who owes what, when payment was expected, and how much remains after part-payments. That view helps you follow up without relying on memory or scattered chat messages.',
    sections: [
      { heading: 'Keep one balance for each customer', paragraphs: ['For every credit sale, record the customer, what they bought, the total amount, the agreed due date, and any payment received. Avoid replacing the original sale with a new total each time. Keeping the activity behind the balance makes disagreements easier to resolve.'] },
      { heading: 'Make partial payments visible', paragraphs: ['A customer who paid part of an invoice is different from a customer who has not paid anything. Record each payment and calculate the remaining balance. This prevents over-following up and gives you a more realistic view of expected cash.'], bullets: ['Original amount owed', 'Payment date and amount', 'Remaining balance', 'Next agreed follow-up date'] },
      { heading: 'Prioritise by cash impact and age', paragraphs: ['Start with balances that are both old and meaningful to your cash position. Then review customers who have missed a promised payment or have several open obligations. A short, regular list is usually more useful than a long report nobody checks.'] },
      { heading: 'Use a clear follow-up message', paragraphs: ['Keep the message factual: name the order or service, state the balance, mention the due date, and ask for a payment date. Clear records make the conversation less emotional because both sides can see what the amount represents.'] },
    ],
    faqs: [
      { question: 'What is the difference between a customer debt and a sale?', answer: 'A sale records what the customer agreed to buy. A customer debt is the unpaid portion that remains after considering payments received.' },
      { question: 'How often should I review customer balances?', answer: 'Review open balances at least weekly if customers regularly buy on credit. More frequent review helps when cash collection is a major part of your operating cycle.' },
    ],
  },
  {
    slug: 'cash-flow-management-for-small-business',
    title: 'Cash-flow management for a small business in Nigeria',
    description: 'Understand projected cash, customer collections, upcoming bills, and the simple routine that helps Nigerian small businesses avoid surprises.',
    eyebrow: 'Cash-flow guide',
    readTime: '8 min read',
    intro: 'Profit and cash are related, but they are not the same thing. A business can have profitable sales and still struggle to pay a supplier this week if customers have not paid yet. Cash-flow management is the habit of keeping incoming money, outgoing obligations, and timing visible together.',
    sections: [
      { heading: 'Know your starting cash position', paragraphs: ['Begin with what is actually available in your cash and bank accounts. Do not include a sale that has not been collected or a payment that is only expected. This starting point becomes the reference for every short-term cash decision.'] },
      { heading: 'List expected money in and money out', paragraphs: ['Write down likely customer collections and the payments the business must make. Include rent, payroll, supplier bills, utilities, loan repayments, and taxes where applicable. Add expected dates, not only totals. Timing is what turns a balance into a cash-flow plan.'] },
      { heading: 'Separate confirmed records from estimates', paragraphs: ['Mark what has already happened, what is promised, and what is only an assumption. This keeps a forecast useful without making it look more certain than it is. Update it when a customer pays, a bill changes, or a new obligation appears.'] },
      { heading: 'Review the next seven and thirty days', paragraphs: ['A weekly view catches immediate payment pressure. A thirty-day view helps you see whether today’s cash position is temporary or whether a larger gap is forming. When a gap appears, act early: follow up on collections, renegotiate timing, or reduce avoidable spending.'] },
    ],
    faqs: [
      { question: 'Why can a profitable business still run out of cash?', answer: 'Because profit can include sales that have not been collected, while bills and operating costs may be due immediately. Cash-flow management focuses on timing as well as total income and expenses.' },
      { question: 'What should a small business include in a cash-flow plan?', answer: 'Include starting cash, expected customer collections, supplier and operating payments, due dates, and a note showing which figures are confirmed records versus estimates.' },
    ],
  },
  {
    slug: 'business-income-and-expenses-template',
    title: 'Business income and expenses template for Nigeria',
    description: 'Use this simple income and expenses structure to organise Nigerian small-business records before moving to a dedicated financial workspace.',
    eyebrow: 'Template guide',
    readTime: '6 min read',
    intro: 'A basic income and expenses template is useful when you are starting to organise business records. The best template is not the one with the most columns. It is the one you can update consistently and use to answer practical questions about cash, costs, customers, and bills.',
    sections: [
      { heading: 'Recommended income columns', paragraphs: ['For money coming into the business, capture the date, customer or source, description, amount, account received into, and whether the money is fully collected or still owed. If you sell on credit, do not mark the full sale as cash received until the payment arrives.'] },
      { heading: 'Recommended expense columns', paragraphs: ['For money going out, capture the date, supplier, description, category, amount, account paid from, and whether the payment relates to an outstanding bill. This gives you both a transaction history and a starting point for reviewing spending.'] },
      { heading: 'Add a notes column for evidence', paragraphs: ['Notes help you remember what a transaction means. Add a receipt reference, order number, payment channel, or explanation for an unusual amount. A short note today can save a long search later.'] },
      { heading: 'When a spreadsheet stops being enough', paragraphs: ['A spreadsheet may become difficult when several people edit it, customers pay in parts, supplier bills remain open, or you need to compare cash with obligations. At that point, a workspace that connects transactions, balances, and review items can reduce manual follow-up.'] },
    ],
    faqs: [
      { question: 'Can I use a spreadsheet to track business income and expenses?', answer: 'Yes. A spreadsheet is a reasonable starting point when the business has a small number of transactions and one person can maintain it consistently.' },
      { question: 'What is the most important column in an income and expenses template?', answer: 'There is no single most important column, but date, description, amount, and account are the foundation. Add customer or supplier details when money is owed or owed to someone else.' },
    ],
  },
  {
    slug: 'how-to-know-if-your-business-is-profitable',
    title: 'How to know if your small business is profitable',
    description: 'A plain-language guide to comparing business income and expenses, checking timing, and avoiding common profit misunderstandings.',
    eyebrow: 'Profitability guide',
    readTime: '7 min read',
    intro: 'Revenue alone does not tell you whether the business is making money. To understand profitability, compare the income the business earned with the costs required to earn it, then check whether unpaid customer balances or one-off payments are distorting the picture.',
    sections: [
      { heading: 'Start with recorded income', paragraphs: ['Choose a clear period, such as a month, and total the income recorded for that period. Keep sales that are still owed separate from money already collected so you can understand both performance and cash.'] },
      { heading: 'Group the costs of running the business', paragraphs: ['Review direct costs, operating expenses, supplier bills, payroll, rent, utilities, transport, and other recurring payments. Consistent categories make it easier to see which costs are growing faster than income.'] },
      { heading: 'Check the story behind the result', paragraphs: ['A positive result may include a large unpaid sale. A negative month may include an annual payment that will not repeat next month. Investigate unusual items before making a major decision. The number is a starting point for review, not a complete explanation.'] },
      { heading: 'Track the trend, not just one month', paragraphs: ['Compare several periods and ask whether income, costs, and cash are moving in a healthy direction. A small business owner usually benefits more from seeing a trend early than from calculating a perfect figure once a year.'] },
    ],
    faqs: [
      { question: 'Is cash in the bank the same as profit?', answer: 'No. Cash in the bank reflects timing, starting balances, collections, and payments. Profit compares income and costs for a period. Both views are useful and answer different questions.' },
      { question: 'How often should I check profitability?', answer: 'Monthly is a practical rhythm for many small businesses. Review sooner when costs change quickly, cash is tight, or the business is taking on new obligations.' },
    ],
  },
  {
    slug: 'receivables-vs-payables',
    title: 'Receivables vs payables: what is the difference?',
    description: 'Understand the difference between customer money owed to your business and supplier bills your business must pay.',
    eyebrow: 'Business finance basics',
    readTime: '5 min read',
    intro: 'Receivables and payables are two sides of the same question: who owes money, and when is it expected to move? Keeping both visible helps a business compare incoming collections with outgoing obligations before a cash gap becomes urgent.',
    sections: [
      { heading: 'Receivables are money customers owe you', paragraphs: ['A receivable is created when you provide goods or services and the customer has not paid the full amount. Record the customer, amount, due date, and every payment received until the balance is settled.'] },
      { heading: 'Payables are bills your business owes', paragraphs: ['A payable is an obligation to a supplier, landlord, service provider, lender, or another party. Record what the bill is for, who it is owed to, the due date, and any partial payment.'] },
      { heading: 'Why the difference matters for cash flow', paragraphs: ['A business may have more receivables than payables and still feel pressure if its customer payments are late while supplier bills are due now. Comparing amount and timing gives you an earlier warning than looking at either list alone.'] },
      { heading: 'A useful monthly review', paragraphs: ['Sort receivables by age and payables by due date. Follow up on old customer balances, confirm upcoming supplier payments, and flag any obligation that could affect the next few weeks of cash.'] },
    ],
    faqs: [
      { question: 'What is an example of a receivable?', answer: 'If a customer buys stock today and agrees to pay in 14 days, the unpaid amount is a receivable until the customer pays.' },
      { question: 'What is an example of a payable?', answer: 'If a supplier delivers goods and sends a bill due next month, the amount your business owes is a payable until it is paid.' },
    ],
  },
];

export function getResourceArticle(slug: string) {
  return resourceArticles.find((article) => article.slug === slug);
}
