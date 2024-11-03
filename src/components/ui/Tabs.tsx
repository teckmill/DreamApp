import React from 'react';

interface TabsProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, onValueChange, children }: TabsProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={`flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <button
      onClick={() => document.dispatchEvent(new CustomEvent('tabChange', { detail: value }))}
      className="flex-1 px-4 py-2 text-sm font-medium rounded-md
                hover:bg-white hover:text-indigo-600
                dark:hover:bg-gray-700 dark:hover:text-indigo-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                data-[state=active]:bg-white data-[state=active]:text-indigo-600
                dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-indigo-400"
      data-state={document.querySelector(`[data-tab="${value}"]`) ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  return (
    <div
      data-tab={value}
      className="focus:outline-none"
      role="tabpanel"
    >
      {children}
    </div>
  );
} 