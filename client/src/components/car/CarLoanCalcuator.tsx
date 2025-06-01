import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LoanCalculatorProps {
  vehiclePrice: number;
}

export function CarLoanCalculator({ vehiclePrice }: LoanCalculatorProps) {
  const [carPrice, setCarPrice] = useState(vehiclePrice || 82000);
  const [downPayment, setDownPayment] = useState(
    Math.max(16400, (vehiclePrice || 82000) * 0.2)
  );
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanPeriod, setLoanPeriod] = useState(60);

  // Real calculations
  const principal = carPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanPeriod;

  const monthlyPayment =
    principal > 0 && monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : principal / numPayments;

  const totalInterest = monthlyPayment * numPayments - principal;
  const totalAmount = principal + totalInterest;

  const downPaymentPercentage = (downPayment / carPrice) * 100;

  // Update down payment when car price changes
  const handleCarPriceChange = (newPrice: number) => {
    setCarPrice(newPrice);
    const minDownPayment = newPrice * 0.2;
    if (downPayment < minDownPayment) {
      setDownPayment(minDownPayment);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-lg p-8 shadow-sm border">
      <h2 className="text-2xl font-bold text-center mb-8">
        CAR LOAN CALCULATOR
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Car Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">
                Car Price
              </label>
              <span className="text-sm font-medium text-gray-900">
                {carPrice.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1000000"
                value={carPrice}
                onChange={(e) => handleCarPriceChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>+1M</span>
              </div>
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">
                Down Payment
              </label>
              <span className="text-sm font-medium text-gray-900">
                {downPayment.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={carPrice * 0.2}
                max={carPrice}
                value={downPayment}
                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider orange"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>20%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">
                Interest Rate (p.a)
              </label>
              <span className="text-sm font-medium text-gray-900">
                {interestRate}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="2"
                max="100"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider orange"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Repayment Period Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">
                Repayment Period
              </label>
              <span className="text-sm font-medium text-gray-900">
                {loanPeriod}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="72"
                value={loanPeriod}
                onChange={(e) => setLoanPeriod(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider orange"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>72 Months</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4 leading-relaxed">
            The Car Loan calculator results illustrated on Motorge.com are only
            intended as a guide. To obtain accurate figures do contact your bank
            or loan provider before applying. Rates are subject to change.
            Please check with your credit score. You must seek an advice from a
            trained professional before applying for a loan. Your vehicle may be
            repossessed if you do not keep up payments on your car loan.
          </div>
        </div>

        {/* Center Column - Nationwide Building Society */}
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6">

          <div className="bg-blue-600 text-white px-4 py-2 rounded mb-2">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9Z" />
              </svg>
              <span className="font-semibold">Nationwide</span>
            </div>
          </div>
          <div className="text-white bg-blue-600 px-3 py-1 rounded text-sm mb-4">
            Building Society
          </div>

          <div className="text-center mb-4">
            <div className="text-gray-600 text-sm mb-2">Monthly Payments</div>
            <div className="text-3xl font-bold text-blue-900">
              QR {Math.round(monthlyPayment).toLocaleString()}
            </div>
          </div>

          <Button
            className="bg-orange-500 text-white hover:bg-orange-600 rounded-full px-8"
            onClick={() => {
              alert("Redirecting to loan application...");
              window.open(
                "https://www.nationwide.co.uk/products/loans/car-loans/",
                "_blank"
              );
            }}
          >
            Apply Now
          </Button>
        </div>

        {/* Right Column - Break-up Chart */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            BREAK-UP OF TOTAL PAYMENT
          </h3>

          {/* Donut Chart */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                ></circle>
                {/* Principal amount (blue) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#1e40af"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="377"
                  strokeDashoffset="75"
                  className="transition-all"
                ></circle>
                {/* Interest amount (orange) */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#ea580c"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="377"
                  strokeDashoffset="300"
                  className="transition-all"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">20%</div>
                  <div className="text-sm text-gray-600">Deposit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Values */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-3 bg-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Principal Amt</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                QR {Math.round(principal).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-3 bg-orange-500 mr-2"></div>
                <span className="text-sm text-gray-600">Interest Amt</span>
              </div>
              <span className="text-sm font-medium text-orange-500">
                QR {Math.round(totalInterest).toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Amt Payable</span>
                <span className="text-sm font-bold text-gray-900">
                  QR {Math.round(totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
