import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NoListingFoundProps {
  resetFilters: () => void;
}

export const NoListingsFound = ({ resetFilters }: NoListingFoundProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Car className="h-16 w-16 text-slate-700 mb-4" />
      <h3 className="text-xl font-medium text-slate-400 mb-2">
        {t("admin.noListingsFound")}
      </h3>
      <p className="text-slate-500 text-center max-w-md mb-4">
        {t("admin.noListingsFoundDesc")}
      </p>
      <Button
        variant="outline"
        onClick={resetFilters}
        className="border-slate-600 text-slate-700 hover:bg-slate-700"
      >
        {t("common.resetFilters")}
      </Button>
    </div>
  );
};