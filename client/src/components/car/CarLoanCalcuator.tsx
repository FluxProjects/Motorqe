import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { calculateMonthlyPayment } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LoanCalculatorProps {
  vehiclePrice: number;
}

interface LoanCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  principalAmount: number;
}

export default function CarLoanCalculator({ vehiclePrice }: LoanCalculatorProps) {
  const [carPrice, setCarPrice] = useState(vehiclePrice);
  const { data: settingsData = [], isLoading, refetch } = useSettings();
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [repaymentPeriod, setRepaymentPeriod] = useState(48);
  const { toast } = useToast();

 const handleApplyNow = () => {
  if (repaymentPeriod === 0) {
    toast({
      title: "Please set a repayment period",
      description: "Enter the number of months for your loan repayment.",
      variant: "destructive",
    });
    return;
  }

  if (loanResults.monthlyPayment === 0) {
    toast({
      title: "Invalid loan calculation",
      description: "Please check your inputs and try again.",
      variant: "destructive",
    });
    return;
  }

  // Navigate on success
  if (settingsData?.bank_url) {
    window.location.href = settingsData.bank_url;
  }
};


  const formatCurrency = (amount: number): string => {
    return `QR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const calculateLoan = useCallback((): LoanCalculation => {
    // Ensure valid inputs
    const validCarPrice = Math.max(0, carPrice);
    const validDownPayment = Math.min(100, Math.max(0, downPaymentPercentage));
    const validInterestRate = Math.max(0, interestRate);
    const validRepaymentPeriod = Math.max(0, repaymentPeriod);
    
    const principal = validCarPrice - (validCarPrice * validDownPayment / 100);
    const monthlyRate = validInterestRate / 100 / 12;
    const numPayments = validRepaymentPeriod;

    // Handle edge cases
    if (numPayments === 0) {
      return {
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayable: principal,
        principalAmount: principal
      };
    }

    if (validInterestRate === 0) {
      // No interest case - simple division
      const monthlyPayment = principal / numPayments;
      return {
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: 0,
        totalPayable: principal,
        principalAmount: principal
      };
    }

    // Standard loan calculation formula
      const monthlyPayment = calculateMonthlyPayment(validCarPrice, {
  downPaymentPercentage: validDownPayment / carPrice,
  interestRate: validInterestRate,
  loanPeriodMonths: validRepaymentPeriod,
});
    
    const totalPayable = monthlyPayment * numPayments;
    const totalInterest = totalPayable - principal;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(Math.max(0, totalInterest)),
      totalPayable: Math.round(totalPayable),
      principalAmount: Math.round(principal)
    };
  }, [carPrice, downPaymentPercentage, interestRate, repaymentPeriod]);

  const loanResults = calculateLoan();
  const downPaymentAmount = carPrice * downPaymentPercentage / 100;

  // Data for the nested donut chart - ensure we have valid data
  const validDownPayment = Math.min(100, Math.max(0, downPaymentPercentage));
  const principalPercentage = 100 - validDownPayment;
  
  const outerChartData = [
    { name: 'Principal', value: principalPercentage, color: '#4F46E5' },
    { name: 'Deposit', value: validDownPayment, color: '#F97316' }
  ];
  
  const innerChartData = [
    { name: 'Principal', value: principalPercentage, color: '#4F46E5' },
    { name: 'Deposit', value: validDownPayment, color: '#F97316' }
  ];

  const SliderInput = ({ 
    label, 
    value, 
    min, 
    max, 
    step = 1, 
    formatValue, 
    minLabel, 
    maxLabel, 
    onChange 
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    formatValue: (val: number) => string;
    minLabel: string;
    maxLabel: string;
    onChange: (val: number) => void;
  }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={formatValue(value)}
          onChange={(e) => {
            // Remove commas and parse as number
            const cleanValue = e.target.value.replace(/,/g, '');
            const newValue = Number(cleanValue);
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              onChange(newValue);
            }
          }}
          onBlur={(e) => {
            const cleanValue = e.target.value.replace(/,/g, '');
            const newValue = Number(cleanValue);
            if (isNaN(newValue) || newValue < min) {
              onChange(min);
            } else if (newValue > max) {
              onChange(max);
            }
          }}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent"
        />
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-orange w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">CAR LOAN CALCULATOR</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Input Controls */}
          <div className="space-y-8">
            <SliderInput
              label="Car Price"
              value={carPrice}
              min={0}
              max={1000000}
              formatValue={(val) => formatNumber(val, 2)}
              minLabel="0"
              maxLabel="+1M"
              onChange={setCarPrice}
            />

            <SliderInput
              label="Down Payment"
              value={Math.round(carPrice * downPaymentPercentage / 100)}
              min={Math.round(carPrice * 20 / 100)}
              max={carPrice}
              formatValue={(val) => formatNumber(val, 2)}
              minLabel="20%"
              maxLabel="100%"
              onChange={(val) => setDownPaymentPercentage(Math.round((val / carPrice) * 100))}
            />

            <SliderInput
              label="Interest Rate (p.a)"
              value={interestRate}
              min={2}
              max={100}
              step={0.1}
              formatValue={(val) => formatNumber(val, 2)}
              minLabel="2%"
              maxLabel="100%"
              onChange={setInterestRate}
            />

            <SliderInput
              label="Repayment Period"
              value={repaymentPeriod}
              min={0}
              max={72}
              formatValue={(val) => formatNumber(val, 0)}
              minLabel="0"
              maxLabel="72 Months"
              onChange={setRepaymentPeriod}
            />
          </div>

          {/* Middle Column - Monthly Payment Card */}
          <div className="flex items-stretch">
            <div className="bg-gray-200 rounded-3xl pt-0 p-8 w-full shadow-sm flex flex-col justify-center min-h-full">
              <div className="text-center">
                {/* Nationwide Building Society Logo */}
                <div className="mb-20 inline-block">
                  <a href={settingsData?.bank_url} target="_blank" rel="noopener noreferrer">
                    <img src={settingsData?.bank_logo} alt={settingsData?.bank_logo} className="max-w-[275px]" />
                  </a>
                </div>
                
                <div className="mb-2">
                  <span className="text-lg text-gray-700 font-medium">Monthly Payments</span>
                </div>
                
                <div className="text-4xl font-bold text-blue-700 mb-20">
                  {formatCurrency(loanResults.monthlyPayment)}
                </div>
                
                <button 
                  onClick={handleApplyNow}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-full transition-colors duration-200 text-lg"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Breakdown */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-black mb-6">BREAK-UP OF TOTAL PAYMENT</h3>
              
              {/* Double Ring Donut Chart */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* Outer ring - umbrella shape (semicircle) */}
                    <Pie
                      data={outerChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={85}
                      outerRadius={120}
                      startAngle={180}
                      endAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {outerChartData.map((entry, index) => (
                        <Cell key={`outer-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Inner ring */}
                    <Pie
                      data={innerChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {innerChartData.map((entry, index) => (
                        <Cell key={`inner-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">{validDownPayment}%</div>
                    <div className="text-base text-orange-500 font-semibold">Deposit</div>
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4F46E5' }}></div>
                    <span className="text-base text-gray-600">Principal Amt</span>
                  </div>
                  <span className="font-bold text-blue-700 text-lg">
                    {formatCurrency(loanResults.principalAmount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F97316' }}></div>
                    <span className="text-base text-gray-600">Interest Amt</span>
                  </div>
                  <span className="font-bold text-orange-600 text-lg">
                    {formatCurrency(loanResults.totalInterest)}
                  </span>
                </div>
                
                <hr className="border-gray-400 my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-600">Total Amt Payable</span>
                  <span className="font-bold text-black text-xl">
                    {formatCurrency(loanResults.totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            The Car Loan calculator results illustrated on Motorqe.com are only intended as a guide. To obtain accurate figures do contact your bank or loan provider before applying. Rates are subject to change and may differ. We also recommend to your lending score. You must seek an advice from a trained professional before applying for a loan. Your vehicle may be repossessed if you do not keep up repayments on your car loan.
          </p>
        </div>
      </div>
    </div>
  );
}