import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Search, ClipboardList, CheckCircle2 } from "lucide-react";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: <Search size={32} className="text-primary" />,
      title: t("home.step1Title"),
      desc: t("home.step1Desc"),
    },
    {
      number: 2,
      icon: <ClipboardList size={32} className="text-primary" />,
      title: t("home.step2Title"),
      desc: t("home.step2Desc"),
    },
    {
      number: 3,
      icon: <CheckCircle2 size={32} className="text-primary" />,
      title: t("home.step3Title"),
      desc: t("home.step3Desc"),
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">
            {t("home.howItWorks")}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
            {t("home.howItWorksSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div className="text-center p-6 bg-white rounded-lg shadow" key={step.number}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light mb-4 mx-auto">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-neutral-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/about"
            className="inline-flex px-6 py-3 rounded-md items-center bg-orange-500 text-white hover:bg-orange-500/80 font-medium transition"
          >
            {t("home.learnMore")} <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
