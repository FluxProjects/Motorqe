import { Progress } from "@/components/ui/progress";

interface Props {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const ProgressHeader = ({ currentStep, totalSteps, stepTitles }: Props) => (
  <div className="mb-8">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
      {stepTitles.map((title, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-medium ${
              index === currentStep ? 'border-orange-500 text-orange-500' : 'border-gray-300 text-gray-500'
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`text-sm ${
              index === currentStep ? 'text-orange-500 font-medium' : 'text-gray-600'
            }`}
          >
            {title}
          </span>
        </div>
      ))}
    </div>
    {/* <Progress value={(currentStep / (totalSteps - 1)) * 100} /> */}
  </div>
);

