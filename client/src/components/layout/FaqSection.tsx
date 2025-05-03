import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FaqSection = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("common.faq.q1.title"),
      answer: t("common.faq.q1.desc"),
    },
    {
      question: t("common.faq.q2.title"),
      answer: t("common.faq.q2.desc"),
    },
    {
      question: t("common.faq.q3.title"),
      answer: t("common.faq.q3.desc"),
    },
    {
      question: t("common.faq.q4.title"),
      answer: t("common.faq.q4.desc"),
    },
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-900">{t("common.faq.title")}</h2>
          <p className="mt-2 text-neutral-600">{t("common.faq.subtitle")}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`} className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <AccordionTrigger className="text-left px-6 py-4 font-medium text-lg text-neutral-800 hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-neutral-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
