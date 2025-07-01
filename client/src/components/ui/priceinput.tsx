import { Combobox } from "./combobox";
import { useState } from "react";

interface PriceInputComboboxProps {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder: string;
  options: number[];
}

export const PriceInputCombobox = ({
  value,
  onChange,
  placeholder,
  options,
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
          label: price.toLocaleString(),
          value: String(price),
        })),
        { label: "1,000,000+ ", value: "1000001" },
      ]}
      allowCustom
    />
  );
};
