import { useState, useCallback, useEffect } from 'react';
import { getNestedValue, isMatchingFhirPathCondition } from '@/lib/fhir-path';

type SearchMode = 'text' | 'fhirpath';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSearch<T extends Record<string, any>>(data: T[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState<SearchMode>('text');
    const debouncedSearchTerm = useDebounce(searchTerm, 1000); // 500ms delay

    const filteredData = useCallback(() => {
        if (!debouncedSearchTerm) return data;

        if (searchMode === 'text') {
            // Recursive function to search through nested objects
            const searchInValue = (value: any): boolean => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(debouncedSearchTerm);
                }
                if (Array.isArray(value)) {
                    return value.some(v => searchInValue(v));
                }
                if (value && typeof value === 'object') {
                    return Object.values(value).some(v => searchInValue(v));
                }
                return false;
            };

            // Simple text search across all fields
            return data.filter(item => {
                return Object.values(item).some(value => searchInValue(value));
            });
        } else {
            // FHIRPath search
            try {
                return data.filter(item => {
                    return isMatchingFhirPathCondition(item, debouncedSearchTerm);
                });
            } catch (error) {
                console.error('Error evaluating FHIRPath:', error);
                return data;
            }
        }
    }, [data, debouncedSearchTerm, searchMode]);

    return {
        searchTerm,
        setSearchTerm,
        searchMode,
        setSearchMode,
        filteredData: filteredData(),
    };
} 