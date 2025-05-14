import { Progress } from "@/components/ui/progress";

interface Props {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const ProgressHeader = ({ currentStep, totalSteps, stepTitles }: Props) => (
  <div className="mb-4">
    <h2 className="text-2xl font-bold">{stepTitles[currentStep]}</h2>
    <Progress value={(currentStep / (totalSteps - 1)) * 100} className="mt-2" />
  </div>
);
