import { describe, expect, it } from 'vitest';
import { getNestedValue } from './fhir-path';

describe('getNestedValue', () => {
    const testData = {
        // Basic object structure
        author: {
            display: "Flavio Ferreira",
            reference: "Practitioner/123"
        },
        meta: {
            lastUpdated: "2025-05-27T15:38:14.348Z",
            project: "0196d846-f275-7096-ba15-5ca3204cf8f4"
        },
        // Array with simple objects
        telecom: [
            {
                system: "email",
                value: "john.doe@acme.org"
            },
            {
                system: "phone",
                value: "+3222222222"
            },
            {
                system: "phone",
                value: "+32476111111",
                use: "mobile"
            }
        ],
        // Array with nested coding structure
        input: [
            {
                type: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/task-input-type",
                            code: "stakeholder",
                            display: "Stakeholder"
                        }
                    ]
                },
                valueString: "Lab"
            },
            {
                type: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/task-input-type",
                            code: "pathway-title",
                            display: "Pathway Title"
                        }
                    ]
                },
                valueString: "testing dev task management"
            },
            {
                type: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/task-input-type",
                            code: "step-name",
                            display: "Step Name"
                        }
                    ]
                },
                valueString: "Show comments in message"
            }
        ],
        // Nested arrays
        address: [
            {
                line: ["Doe Street 1"],
                city: "Doe City",
                postalCode: "6789"
            }
        ],
        // Complex nested structure
        communication: [
            {
                language: {
                    coding: [
                        {
                            system: "urn:ietf:bcp:47",
                            code: "en"
                        }
                    ]
                }
            }
        ]
    };

    describe('Basic Object Access', () => {
        it('should access simple nested properties', () => {
            expect(getNestedValue(testData, 'author.display')).toBe('Flavio Ferreira');
            expect(getNestedValue(testData, 'meta.lastUpdated')).toBe('2025-05-27T15:38:14.348Z');
        });
    });

    describe('Array Access', () => {
        describe('Index-based Access', () => {
            it('should access array items by index', () => {
                expect(getNestedValue(testData, 'telecom[0].value')).toBe('john.doe@acme.org');
                expect(getNestedValue(testData, 'telecom[1].value')).toBe('+3222222222');
            });
        });

        describe('Field-based Filtering', () => {
            it('should find items by simple field value', () => {
                expect(getNestedValue(testData, 'telecom.where(system = \'phone\' and use.empty()).value')).toBe('+3222222222');
                expect(getNestedValue(testData, 'telecom.where(system = \'email\').value')).toBe('john.doe@acme.org');
                expect(getNestedValue(testData, 'telecom.where(system = \'phone\' and use = \'mobile\').value')).toBe('+32476111111');
            });

            it('should find items by nested field value', () => {
                expect(getNestedValue(testData, 'input.where(type.coding[0].code = \'stakeholder\').valueString')).toBe('Lab');
                expect(getNestedValue(testData, 'input.where(type.coding[0].code = \'pathway-title\').valueString')).toBe('testing dev task management');
                expect(getNestedValue(testData, 'input.where(type.coding[0].code = \'step-name\').valueString')).toBe('Show comments in message');
            });
        });
    });

    describe('Complex Nested Structures', () => {
        it('should handle deeply nested arrays and objects', () => {
            expect(getNestedValue(testData, 'communication[0].language.coding[0].code')).toBe('en');
            expect(getNestedValue(testData, 'address[0].line[0]')).toBe('Doe Street 1');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null/undefined values', () => {
            expect(getNestedValue(testData, 'nonexistent.path')).toBeUndefined();
            expect(getNestedValue(testData, 'telecom[999].value')).toBeUndefined();
        });

        it('should handle array values', () => {
            expect(getNestedValue(testData, 'address[0].line')).toBe('Doe Street 1');
        });

        it('should handle object values', () => {
            expect(getNestedValue(testData, 'author')).toEqual({
                display: "Flavio Ferreira",
                reference: "Practitioner/123"
            });
        });
    });

    describe('FHIR-specific Patterns', () => {
        it('should handle task input patterns', () => {
            expect(getNestedValue(testData, 'input.where(type.coding[0].code = \'stakeholder\').valueString')).toBe('Lab');
            expect(getNestedValue(testData, 'input.where(type.coding[0].code = \'pathway-title\').valueString')).toBe('testing dev task management');
            expect(getNestedValue(testData, 'input.where(type.coding[0].code = \'step-name\').valueString')).toBe('Show comments in message');
        });
    });
}); 