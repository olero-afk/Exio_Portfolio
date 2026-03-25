import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { TimePeriod, DateRange } from '../types/index.ts';

interface FilterContextValue {
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  customDateRange: DateRange | null;
  setCustomDateRange: (range: DateRange | null) => void;
  effectiveDateRange: DateRange;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDateRangeForPeriod(period: TimePeriod, custom: DateRange | null): DateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (period) {
    case 'denne_maaneden':
      return {
        startDate: toLocalDateString(new Date(year, month, 1)),
        endDate: toLocalDateString(new Date(year, month + 1, 0)),
      };
    case 'forrige_maaned':
      return {
        startDate: toLocalDateString(new Date(year, month - 1, 1)),
        endDate: toLocalDateString(new Date(year, month, 0)),
      };
    case 'siste_6_maaneder':
      return {
        startDate: toLocalDateString(new Date(year, month - 5, 1)),
        endDate: toLocalDateString(new Date(year, month + 1, 0)),
      };
    case 'neste_6_maaneder':
      return {
        startDate: toLocalDateString(new Date(year, month, 1)),
        endDate: toLocalDateString(new Date(year, month + 6, 0)),
      };
    case 'dette_aaret':
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      };
    case 'forrige_aar':
      return {
        startDate: `${year - 1}-01-01`,
        endDate: `${year - 1}-12-31`,
      };
    case 'neste_aar':
      return {
        startDate: `${year + 1}-01-01`,
        endDate: `${year + 1}-12-31`,
      };
    case 'egendefinert':
      return custom ?? {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      };
  }
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('dette_aaret');
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);

  const effectiveDateRange = useMemo(
    () => getDateRangeForPeriod(timePeriod, customDateRange),
    [timePeriod, customDateRange]
  );

  const value: FilterContextValue = {
    selectedBuildingId,
    setSelectedBuildingId,
    timePeriod,
    setTimePeriod,
    customDateRange,
    setCustomDateRange,
    effectiveDateRange,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
}
