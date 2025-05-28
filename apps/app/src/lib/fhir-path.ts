// Type definitions for fhirpath
declare module 'fhirpath' {
    export function evaluate(resource: any, path: string): any[];
}

import fhirpath from 'fhirpath';

/**
 * Gets a nested value from a FHIR resource using a FHIRPath expression.
 * Supports array access with indices and field-based filtering.
 * 
 * @param obj - The FHIR resource to get the value from
 * @param path - The FHIRPath expression (e.g., 'author.display', 'telecom.where(system = "phone").value')
 * @returns The value at the specified path, or an empty string if not found
 */
export const getNestedValue = (obj: Record<string, any>, path: string): any | any[] => {
    try {
        return fhirpath.evaluate(obj, path);

    } catch (error) {
        console.error('Error evaluating FHIRPath:', error);
        return '';
    }
}; 