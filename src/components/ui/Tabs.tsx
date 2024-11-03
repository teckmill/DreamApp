import React, { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState(defaultValue);

  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const newValue = event.detail;
      setActiveTab(newValue);
      onValueChange(newValue);
    };

    document.addEventListener('tabChange', handleTabChange as EventListener);
    return () => {
      document.removeEventListener('tabChange', handleTabChange as EventListener);
    };
  }, [onValueChange]);

  return (
    <div className="w-full" data-active-tab={activeTab}>
      {children}
    </div>
  );
}

export function TabsList({ className = '', children }: TabsListProps) {
  return (
    <div className={`flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const isActive = document.querySelector(`[data-active-tab="${value}"]`) !== null;

  return (
    <button
      onClick={() => document.dispatchEvent(new CustomEvent('tabChange', { detail: value }))}
      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const isActive = document.querySelector(`[data-active-tab="${value}"]`) !== null;

  if (!isActive) return null;

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