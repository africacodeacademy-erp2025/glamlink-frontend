import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";

// Context for Select
const SelectContext = createContext<any>(null);

export const Select: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, triggerRef, contentRef }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setOpen, triggerRef } = useContext(SelectContext);
  return (
    <button
      ref={triggerRef}
      type="button"
      className="w-full border rounded px-2 py-1 flex items-center justify-between bg-white"
      onClick={() => setOpen((o: boolean) => !o)}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({
  placeholder,
}) => {
  const { value } = useContext(SelectContext);
  return (
    <span className={value ? "" : "text-gray-400"}>{value || placeholder}</span>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { open, contentRef } = useContext(SelectContext);
  if (!open) return null;
  return (
    <div
      ref={contentRef}
      className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto"
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const { onValueChange, setOpen } = useContext(SelectContext);
  return (
    <div
      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
};
