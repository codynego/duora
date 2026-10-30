export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  readTime: string;
  intro: string;
  publishedAt?: string;
  updatedAt?: string;
  relatedSlugs?: string[];
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
  {
    slug: '30-day-cash-flow-forecast-small-business-nigeria',
    title: 'How to create a 30-day cash-flow forecast for a small business in Nigeria',
    description: 'Build a practical 30-day cash-flow forecast by combining available cash, expected customer payments, bills, and realistic payment dates.',
    eyebrow: 'Cash-flow forecasting guide',
    readTime: '9 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['cash-flow-management-for-small-business', 'how-to-track-customer-debts', 'how-much-cash-reserve-small-business'],
    intro: 'A 30-day cash-flow forecast is a short plan for the money your business expects to receive and pay over the next four weeks. It does not need perfect predictions. It needs clear dates, realistic assumptions, and a routine for updating the plan when a customer pays late or a new bill appears.',
    sections: [
      { heading: 'Start with cash you can use today', paragraphs: ['Begin with the balance that is actually available in your business cash and bank accounts. Do not add invoices that customers have not paid, promised transfers, or stock you expect to sell. The forecast is only useful when its opening balance is real.', 'If you keep cash in more than one place, list each account separately before calculating the total. That makes it easier to see whether money is available for the payment you need to make.'] },
      { heading: 'List expected collections by their likely date', paragraphs: ['Add every customer payment you expect during the next 30 days. Record the customer, amount, expected payment date, and confidence level. A promised payment is not the same as a payment already confirmed, so keep those labels visible.', 'Use the date the cash is likely to arrive, not the original invoice date. When a customer has a history of paying late, use their usual payment behaviour rather than the most optimistic date.'], bullets: ['Customer name and outstanding balance', 'Likely payment date', 'Expected amount after partial payments', 'Confirmed, promised, or uncertain status'] },
      { heading: 'Add bills and operating payments by due date', paragraphs: ['List supplier bills, rent, payroll, utilities, loan repayments, subscriptions, taxes, and other expected outflows. Include the date each payment must leave the business, not only the monthly total.', 'Separate essential payments from costs that can be delayed without harming the business. This does not mean ignoring obligations; it helps you identify where an early conversation with a supplier may prevent a last-minute cash problem.'] },
      { heading: 'Review the lowest point, then update weekly', paragraphs: ['Calculate your projected balance after each incoming and outgoing item. The most important number is often the lowest expected balance, not the month-end total. A positive month-end figure can hide a difficult week in the middle of the month.', 'Review the forecast at least once a week and whenever a meaningful payment changes. Replace estimates with actuals, move delayed collections, and add new obligations. A simple living forecast is more useful than a detailed sheet that is never updated.'] },
    ],
    faqs: [
      { question: 'What should be included in a 30-day cash-flow forecast?', answer: 'Include available starting cash, expected customer collections, supplier and operating payments, likely payment dates, and a running projected balance. Mark uncertain amounts so the forecast does not look more certain than it is.' },
      { question: 'How often should I update a cash-flow forecast?', answer: 'Update it weekly for most small businesses, and sooner when a major customer payment, supplier bill, or operating cost changes.' },
    ],
  },
  {
    slug: 'payment-reminder-messages-overdue-customers-nigeria',
    title: 'Payment reminder messages for overdue customers in Nigeria',
    description: 'Use clear, respectful payment reminders to follow up on customer balances, agree a payment date, and protect cash flow without creating unnecessary friction.',
    eyebrow: 'Customer collections guide',
    readTime: '8 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['how-to-track-customer-debts', '30-day-cash-flow-forecast-small-business-nigeria', 'customer-credit-management-small-business'],
    intro: 'Following up on an overdue payment can feel uncomfortable, especially when the customer is someone you know. A good reminder keeps the conversation factual: identify the sale or service, state the remaining balance, mention the agreed due date, and ask for a specific next step.',
    sections: [
      { heading: 'Prepare the record before you send a reminder', paragraphs: ['Check the original sale, all partial payments, the due date, and any previous agreement before contacting the customer. This prevents an avoidable error and gives you confidence when the customer asks a question.', 'Keep one clear record of every follow-up. Note the date, the channel used, the response, and the next promised action. A short history helps you decide when to send another reminder or make a phone call.'] },
      { heading: 'Use a polite first reminder', paragraphs: ['Send the first message shortly after the due date. Keep it brief and assume the customer may have missed the date rather than deliberately ignored it. Include the exact balance and an easy way to confirm when payment will be made.', 'Example: Hello [Name], this is a reminder that ₦[amount] remains outstanding for [order or service], which was due on [date]. Please let us know when we can expect payment. Thank you.'] },
      { heading: 'Escalate clearly when the balance remains unpaid', paragraphs: ['If there is no reply, follow up with the same facts and request a specific payment date. Avoid vague wording such as “please pay soon.” A clear request makes it easier to plan your own cash flow and shows the customer what you need from them.', 'Example: Hello [Name], ₦[amount] is still outstanding for [order or service]. Please confirm a payment date by [date]. If you need to pay in instalments, share a realistic schedule so we can update our records.'] },
      { heading: 'Agree and record a workable next step', paragraphs: ['A customer may not be able to pay the full balance immediately. If you agree to instalments, record each amount and date rather than replacing the debt with an informal promise. This keeps the outstanding balance accurate.', 'For recurring late payers, consider setting a credit limit, asking for a deposit, shortening payment terms, or pausing additional credit sales until the account is brought up to date.'] },
    ],
    faqs: [
      { question: 'When should I send a payment reminder?', answer: 'Send a friendly reminder shortly after the due date. For important balances, a reminder before the due date can also help the customer prepare.' },
      { question: 'What should an overdue payment reminder include?', answer: 'Include the customer name, what the balance relates to, the remaining amount, the due date, and a request for a specific payment date or response.' },
    ],
  },
  {
    slug: 'how-much-cash-reserve-small-business',
    title: 'How much cash reserve should a small business keep?',
    description: 'Learn how to set a practical cash reserve using essential weekly costs, payment timing, business volatility, and a gradual savings target.',
    eyebrow: 'Business cash reserve guide',
    readTime: '8 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['30-day-cash-flow-forecast-small-business-nigeria', 'cash-flow-management-for-small-business', 'revenue-profit-cash-difference'],
    intro: 'A cash reserve is money the business keeps available for ordinary pressure: late customer payments, a slow sales week, a repair, or an essential bill that arrives before collections. There is no single amount that fits every business. The useful target depends on what the business must pay and how predictable its cash flow is.',
    sections: [
      { heading: 'Calculate your essential operating costs', paragraphs: ['Start with the costs that keep the business operating: core staff payments, rent, utilities, critical supplier purchases, transport, loan repayments, and basic software or service costs. Leave out optional spending for this first calculation.', 'Total these costs for a typical month, then divide by four to estimate a weekly baseline. This gives you a practical reference point for deciding what a one-week or four-week reserve means for your business.'] },
      { heading: 'Consider how reliable your collections are', paragraphs: ['A business that receives cash at the point of sale may need a different reserve from a business that waits 30 or 60 days for customers to pay. The longer and less predictable the collection cycle, the more protection you may need.', 'Also consider seasonality and dependency. If one major customer represents a large share of your expected cash, or sales fall at certain times of year, your reserve target should reflect that risk.'] },
      { heading: 'Set a gradual and realistic target', paragraphs: ['If you have no reserve today, do not wait until you can save several months of costs. Start with a smaller goal such as one week of essential costs, then increase it over time as cash flow improves.', 'Keep the reserve separate from day-to-day spending where possible. Label it clearly, review it monthly, and only use it for a genuine business cash gap or essential interruption.'] },
      { heading: 'Use the reserve with a plan to rebuild it', paragraphs: ['Using a reserve is not necessarily a failure. It may be the reason the business can meet a critical obligation without taking expensive emergency credit. The important step is to understand why it was needed.', 'After using it, update your cash-flow forecast, decide how much to rebuild each week or month, and address the source of the pressure if possible: delayed collections, rising costs, or an unrealistic payment schedule.'] },
    ],
    faqs: [
      { question: 'Is cash reserve the same as profit?', answer: 'No. Profit compares income and costs over a period. A cash reserve is money deliberately kept available to handle timing gaps and unexpected essential costs.' },
      { question: 'Where should a business keep its cash reserve?', answer: 'Keep it somewhere accessible and separate enough that it is not accidentally used for routine spending. The right account or product depends on your access needs and financial provider.' },
    ],
  },
  {
    slug: 'revenue-profit-cash-difference',
    title: 'Revenue vs profit vs cash: what is the difference for a small business?',
    description: 'Understand the difference between sales, profit, and available cash so you can make better decisions about spending, customer credit, and growth.',
    eyebrow: 'Business finance basics',
    readTime: '7 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['how-to-know-if-your-business-is-profitable', '30-day-cash-flow-forecast-small-business-nigeria', 'how-much-cash-reserve-small-business'],
    intro: 'Revenue, profit, and cash are related, but they answer different questions. Revenue tells you what the business earned from sales. Profit compares that income with costs. Cash tells you what money is actually available to pay for the next obligation. Confusing them can lead to avoidable pressure.',
    sections: [
      { heading: 'Revenue is the value of sales', paragraphs: ['Revenue is the money the business earns by selling products or services during a period. A sale on credit can count as revenue even when the customer has not paid yet.', 'Revenue is useful for measuring demand and comparing sales periods. By itself, however, it does not tell you whether costs are under control or whether you can pay a supplier today.'] },
      { heading: 'Profit is what remains after relevant costs', paragraphs: ['Profit is the income left after subtracting the costs required to operate the business for the period. These may include stock, supplier costs, rent, staff, delivery, utilities, and other operating expenses.', 'A business can have strong revenue but weak profit when costs rise faster than sales. It can also have a low-profit month because of a one-off cost, which is why reviewing the detail and the trend matters.'] },
      { heading: 'Cash is the money available now', paragraphs: ['Cash includes the money that has actually reached your cash or bank accounts. It changes when customers pay, when you pay suppliers, when you take a loan, or when you make an owner withdrawal.', 'A profitable business can still have too little cash if customers have not paid yet or a large bill is due before collections arrive. This is why a cash-flow forecast is useful alongside a profit review.'] },
      { heading: 'Review all three before major decisions', paragraphs: ['Before buying stock, adding a staff member, or taking on a new payment, ask three questions: are sales healthy, are we making enough after costs, and will cash be available on the needed date?', 'Dorah is designed to help keep transactions, customer balances, bills, and cash movement visible together. No single number tells the whole story.'] },
    ],
    faqs: [
      { question: 'Can a profitable business run out of cash?', answer: 'Yes. Profit can include credit sales that have not been collected, while rent, payroll, and supplier bills may require payment now.' },
      { question: 'Is revenue the same as money received?', answer: 'Not always. Revenue can include sales made on credit. Money received is cash that has actually been collected.' },
    ],
  },
  {
    slug: 'business-expense-categories-small-business-nigeria',
    title: 'Common business expense categories for small businesses in Nigeria',
    description: 'Organise business spending with practical expense categories that make monthly reviews, cost control, and financial decisions easier.',
    eyebrow: 'Expense tracking guide',
    readTime: '8 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['how-to-track-business-expenses', 'how-to-know-if-your-business-is-profitable', 'weekly-financial-checklist-small-business'],
    intro: 'Expense categories turn a long list of payments into something you can review. They should be simple enough to use consistently and detailed enough to show what is changing. The best set is usually based on how your business actually spends money, not a complicated chart copied from somewhere else.',
    sections: [
      { heading: 'Use a small set of clear core categories', paragraphs: ['Most small businesses can begin with categories such as stock or materials, supplier purchases, rent, staff costs, transport, utilities, marketing, repairs, professional services, bank charges, and owner withdrawals.', 'Create a separate category only when it will help you make a decision. If a type of payment is rare or small, a broader category may be enough at first. Consistency is more valuable than a very long list.'], bullets: ['Stock, materials, or cost of goods', 'Rent, utilities, and communication', 'Staff, contractor, and delivery costs', 'Transport and fuel', 'Marketing, sales, and customer acquisition', 'Repairs, equipment, and professional services'] },
      { heading: 'Keep business and personal spending distinct', paragraphs: ['Personal spending can make business reports misleading when it is mixed into ordinary operating expenses. Use a separate business account where possible and label owner withdrawals or owner-funded payments clearly.', 'When you pay a business cost personally, still record it with a note. The goal is not to hide the transaction; it is to keep the business picture accurate.'] },
      { heading: 'Use descriptions and supplier names as evidence', paragraphs: ['A category alone is not always enough to explain a payment. Record a short description, the supplier, the date, and a receipt or reference where you have one. This makes it easier to investigate a number during a monthly review.', 'The same supplier may appear under different categories when they provide different things. Use the purpose of the payment, not only the supplier name, when deciding how to categorise it.'] },
      { heading: 'Review categories monthly and simplify when needed', paragraphs: ['Compare the current month with earlier periods to see which categories are growing, repeating, or unusually high. Ask whether the change is expected, temporary, or a sign that the business needs to act.', 'Review your category list every few months. Merge categories nobody uses and add one when a recurring cost is being hidden inside a vague “other” bucket.'] },
    ],
    faqs: [
      { question: 'What expense categories should a small business track?', answer: 'Start with the recurring costs that matter to your business, such as stock, rent, staff, transport, utilities, marketing, repairs, and professional services.' },
      { question: 'Should owner withdrawals be recorded as an expense?', answer: 'Record owner withdrawals clearly and separately so they do not distort the operating costs used to understand business performance. Consult a qualified accountant for treatment that applies to your business and obligations.' },
    ],
  },
  {
    slug: 'customer-credit-management-small-business',
    title: 'How to manage customer credit and partial payments in a small business',
    description: 'Set clearer customer credit terms, record part-payments correctly, and follow up on balances before they become a cash-flow problem.',
    eyebrow: 'Customer credit guide',
    readTime: '9 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['how-to-track-customer-debts', 'payment-reminder-messages-overdue-customers-nigeria', '30-day-cash-flow-forecast-small-business-nigeria'],
    intro: 'Selling on credit can help customers buy from you, but it also means your business is financing part of the sale until the customer pays. Good credit management is not about being harsh. It is about setting clear expectations, making every payment visible, and deciding how much unpaid exposure the business can safely carry.',
    sections: [
      { heading: 'Set terms before you make the credit sale', paragraphs: ['Agree the price, deposit, remaining balance, due date, and payment method before delivering the product or service. Put the agreement in a message, invoice, or document the customer can refer to later.', 'Use terms that your business can afford. If you need cash to restock in seven days, offering everyone 30 days to pay may create pressure even when sales appear strong.'] },
      { heading: 'Record each sale and each partial payment', paragraphs: ['Keep the original sale amount visible, then record every payment against it. Do not replace the original amount with the latest balance because you may later need to explain how the balance was reached.', 'For each payment, save the date, amount, payment method, and reference. This helps prevent both accidental over-follow-up and the common disagreement where a customer says they paid without a clear matching record.'] },
      { heading: 'Use a credit limit and a follow-up rhythm', paragraphs: ['A simple credit limit can prevent one customer from holding too much of your working cash. The limit may be an amount, a maximum number of unpaid orders, or a rule that old balances must be settled before new credit is given.', 'Review open balances weekly. Sort them by overdue days and amount, follow up early, and agree a realistic plan when a customer cannot pay in full.'] },
      { heading: 'Decide when to pause new credit', paragraphs: ['When an agreed payment date has passed without a response, consider pausing further credit sales until the customer communicates a payment plan. This is a business rule, not a personal judgement.', 'Apply your process consistently. A clear rule is easier to explain to customers and protects your business from letting a small unpaid balance become a large one.'] },
    ],
    faqs: [
      { question: 'How do I track a customer who pays in instalments?', answer: 'Record the original sale, every payment date and amount, the remaining balance, and the next agreed payment date. Keep all of this linked to the same customer balance.' },
      { question: 'Should every customer get credit?', answer: 'Not necessarily. Decide based on your business cash needs, the customer relationship, payment history, and the amount of risk you can carry.' },
    ],
  },
  {
    slug: 'weekly-financial-checklist-small-business',
    title: 'A weekly financial checklist for small business owners',
    description: 'Use this practical weekly financial checklist to update transactions, review cash, follow up on customer debts, and prepare for upcoming bills.',
    eyebrow: 'Weekly finance checklist',
    readTime: '7 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['how-to-track-business-expenses', 'how-to-track-customer-debts', '30-day-cash-flow-forecast-small-business-nigeria'],
    intro: 'A short weekly review prevents small record-keeping gaps from becoming a month-end scramble. Choose a recurring time when you can look at the business without interruption. The aim is not to produce formal accounts each week; it is to know what happened, what is outstanding, and what needs attention next.',
    sections: [
      { heading: 'Bring records up to date', paragraphs: ['Record sales, customer payments, supplier payments, expenses, transfers, and owner activity since your last review. Add enough detail that you will understand the transaction in a month: date, amount, description, category, account, and customer or supplier where relevant.', 'Match your records against bank alerts, transfer confirmations, cash notes, receipts, or invoices. Investigate duplicates, missing items, and payments you cannot explain before they become harder to trace.'] },
      { heading: 'Review cash and the next seven days', paragraphs: ['Check the cash and bank balances you can actually use, then list the payments that are due before the next review. Include recurring costs and supplier commitments, not only bills that are already overdue.', 'Compare this with likely customer collections. If a gap is forming, act early by following up on an invoice, confirming a supplier date, reducing a non-essential cost, or updating your cash-flow forecast.'] },
      { heading: 'Review customer and supplier balances', paragraphs: ['Sort customer balances by overdue age and amount. Follow up on the highest-impact overdue amounts first, and update any payment promises you receive.', 'Review supplier bills by due date. Make sure you understand which payments are essential to operations and whether any bills need a conversation before their due date.'] },
      { heading: 'Write down one decision and one follow-up', paragraphs: ['End the review with a short action list. Examples include “confirm Customer A’s payment date,” “record the transport receipts,” or “hold off on non-essential equipment until next week.”', 'A weekly finance habit succeeds when it leads to small actions. Keep it short enough that you will do it again next week.'] },
    ],
    faqs: [
      { question: 'How long should a weekly financial review take?', answer: 'For many small businesses, 30 to 60 minutes is enough once records are kept regularly. The time depends on transaction volume and how many people handle money.' },
      { question: 'What should I look at every week in my business finances?', answer: 'Update transactions, check usable cash, review upcoming bills, follow up on customer balances, and write down the next actions that protect cash flow.' },
    ],
  },
  {
    slug: 'can-my-business-afford-a-new-purchase',
    title: 'Can my business afford a new purchase? A cash-flow checklist',
    description: 'Use a practical cash-flow checklist before buying equipment, stock, or another major item for your small business.',
    eyebrow: 'Business purchase planning guide',
    readTime: '8 min read',
    publishedAt: '2026-10-30',
    updatedAt: '2026-10-30',
    relatedSlugs: ['30-day-cash-flow-forecast-small-business-nigeria', 'how-much-cash-reserve-small-business', 'revenue-profit-cash-difference'],
    intro: 'A business can want a new piece of equipment, more stock, or a major service and still need to wait before buying it. The right question is not only whether the business has enough money today. It is whether the purchase leaves enough cash for essential payments, likely delays, and the value it is expected to create.',
    sections: [
      { heading: 'Separate the purchase price from the full cost', paragraphs: ['Start with the full cost of buying and using the item. Include delivery, installation, repairs, fuel, subscription charges, training, financing costs, insurance, or the working capital needed to turn new stock into sales.', 'A lower upfront price is not always the lower-cost option. Compare the cost, reliability, maintenance, and the time before the purchase is expected to help the business generate or protect cash.'] },
      { heading: 'Check the next 30 days before committing', paragraphs: ['Update your 30-day cash-flow forecast before you pay. Include the purchase on its actual payment date, then look at the lowest projected balance after customer collections and essential bills are considered.', 'If the purchase creates a cash gap, decide whether it can be delayed, paid in stages, funded from a specific collection, or replaced with a lower-risk option. Do not rely on a customer payment that has not been confirmed.'] },
      { heading: 'Protect essential costs and your cash reserve', paragraphs: ['Do not use money needed for rent, payroll, critical suppliers, or overdue obligations simply because the purchase feels urgent. A purchase that creates an operational cash crisis is more expensive than it first appears.', 'If you use part of a reserve, make a plan for how and when it will be rebuilt. The purchase should not leave the business unable to absorb a late payment or necessary repair.'] },
      { heading: 'Define what a successful purchase looks like', paragraphs: ['Write down the reason for the purchase and the result you expect: reduced delivery costs, faster production, more sales capacity, less waste, or fewer breakdowns. Then choose a date to review whether that result is happening.', 'This creates a useful feedback loop. Over time, your business learns which purchases genuinely improve operations and which ones use cash without delivering the expected value.'] },
    ],
    faqs: [
      { question: 'Should I buy equipment from my business cash?', answer: 'It depends on whether the payment still leaves enough cash for essential obligations, expected timing gaps, and a workable reserve. Review the next 30 days before deciding.' },
      { question: 'How do I know whether a business purchase is worth it?', answer: 'Compare the full cost with the specific benefit you expect, such as extra sales capacity, lower operating costs, or reduced downtime. Set a date to review the result after buying.' },
    ],
  },
];

export function getResourceArticle(slug: string) {
  return resourceArticles.find((article) => article.slug === slug);
}
