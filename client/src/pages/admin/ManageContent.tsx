// ManageContent.tsx

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@shared/schema"; // Add your content type here
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { RefreshCw } from "lucide-react";

const ManageContent: FC = () => {
  const { t } = useTranslation();
  const {
    data: contents,
    isLoading,
    refetch,
    error,
  } = useQuery<Content[]>({
    queryKey: ["admin-contents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/contents");
      if (!response.ok) {
        throw new Error("Failed to fetch contents");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Admin Sidebar */}
            <div className="hidden md:block">
              <DashboardSidebar type="ADMIN" />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold sm:text-3xl truncate">
                      {t("admin.manageContent")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400 sm:text-base truncate">
                      {t("admin.manageContentDesc")}
                    </p>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => refetch()}
                      disabled={isLoading}
                      className="p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      aria-label={t("common.refresh")}
                    >
                      <RefreshCw
                        className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {contents?.map((content) => (
                      <div
                        key={content.id}
                        className="p-4 border rounded-md bg-slate-800 text-white"
                      >
                        <h3 className="text-xl font-semibold">
                          {content.title}
                        </h3>
                        <p className="mt-2 text-slate-300">{content.body}</p>
                        {/* Add more fields if needed, e.g., createdAt, author */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageContent;
