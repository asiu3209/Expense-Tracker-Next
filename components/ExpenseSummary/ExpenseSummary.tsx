interface ExpenseSummaryProps {
  totalAmount: number;
  expenseCount: number;
  period?: string;
}

function ExpenseSummary({
  totalAmount,
  expenseCount,
  period = "All Time",
}: ExpenseSummaryProps) {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount);

  return (
    <section className="bg-white rounded-lg p-6 mb-8 shadow border border-gray-200">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200 md:flex-row md:gap-0 md:text-left flex-col gap-3 text-center font-bold">
        <h2 className="text-black font-bold m-0 md:text-2xl text-2xl">
          Expense Summary
        </h2>
        <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-sm font-bold">
          {period}
        </span>
      </div>

      <div className="flex gap-8 md:flex-row md:gap-8 flex-col gap-5">
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm font-medium text-gray-500 mb-2 text-center">
            Total Spent
          </span>
          <span className="text-2xl font-bold text-gray-800 text-center md:text-2xl sm:text-xl xs:text-lg">
            {formattedTotal}
          </span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <span className="text-sm font-medium text-gray-500 mb-2 text-center">
            Expenses
          </span>
          <span className="text-2xl font-bold text-gray-800 text-center md:text-2xl sm:text-xl xs:text-lg">
            {expenseCount}
          </span>
        </div>
      </div>
    </section>
  );
}

export default ExpenseSummary;
