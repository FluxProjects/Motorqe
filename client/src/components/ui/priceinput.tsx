import { Combobox } from "./combobox";
import { useState } from "react";

interface PriceInputComboboxProps {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder: string;
  options: number[];
  useCommas?: boolean; 
}

export const PriceInputCombobox = ({
  value,
  onChange,
  placeholder,
  options,
  useCommas = true,
}: PriceInputComboboxProps) => {
  const [inputValue, setInputValue] = useState(value ? String(value) : "");

  const handleSelect = (val: string) => {
    setInputValue(val);
    const parsed = parseInt(val.replace(/,/g, ""), 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <Combobox
      value={inputValue}
      onValueChange={handleSelect}
      placeholder={placeholder}
      options={[
        ...options.map((price) => ({
          label: useCommas ? price.toLocaleString() : String(price),
          value: String(price),
        })),
        {
          label: useCommas ? "1,000,000+" : "1000000+",
          value: "1000001",
        },
      ]}
      allowCustom
    />
  );
};
