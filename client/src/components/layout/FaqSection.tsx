import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FaqSection = () => {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<string | null>(null);

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

  const toggleItem = (value: string) => {
    setOpenItem((prev) => (prev === value ? null : value));
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-900">
            {t("common.faq.title")}
          </h2>
          <p className="mt-2 text-neutral-600">
            {t("common.faq.subtitle")}
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="space-y-3"
          onValueChange={toggleItem}
        >
          {faqs.map((faq, index) => {
            const isOpen = openItem === `faq-${index}`;
            return (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className={cn(
                  "border-2 rounded-md",
                  isOpen ? "border-[#0057B8] bg-[#0057B8]/10" : "border-[#0057B8] bg-white"
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "group w-full px-6 py-4 flex justify-between items-center text-left",
                    "font-bold text-base uppercase text-black tracking-wide hover:bg-[#0057B8]/10 transition"
                  )}
                >
                  <span className="flex-1 text-left">{faq.question}</span>
                  <span className="text-2xl ml-4">
                    {isOpen ? "−" : "+"}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 text-sm text-neutral-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
