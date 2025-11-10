import React, { useState } from "react";

export const Tabs: React.FC<{
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}> = ({ defaultValue, className = "", children }) => {
  const [active, setActive] = useState(defaultValue);
  // Provide context to children
  return (
    <div className={className} data-tabs-active={active}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(
            child as React.ReactElement<{
              active?: string;
              setActive?: (value: string) => void;
            }>,
            { active, setActive }
          );
        }
        if (React.isValidElement(child) && child.type === TabsContent) {
          return React.cloneElement(
            child as React.ReactElement<{ active?: string }>,
            { active }
          );
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<{
  children: React.ReactNode;
  active?: string;
  setActive?: (value: string) => void;
}> = ({ children, active, setActive }) => (
  <div className="flex gap-2 border-b mb-4">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(
          child as React.ReactElement<{
            active?: string;
            setActive?: (value: string) => void;
          }>,
          { active, setActive }
        );
      }
      return child;
    })}
  </div>
);

export const TabsTrigger: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: string;
  setActive?: (value: string) => void;
}> = ({ value, className = "", children, active, setActive }) => (
  <button
    className={`px-4 py-2 rounded-t ${active === value ? "bg-white border-t border-x border-b-0 font-bold" : "bg-gray-100 text-gray-600"} ${className}`}
    onClick={() => setActive && setActive(value)}
    type="button"
  >
    {children}
  </button>
);

export const TabsContent: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
  active?: string;
}> = ({ value, className = "", children, active }) => {
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
};
