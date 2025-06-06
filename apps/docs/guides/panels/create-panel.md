# How to create a panel

> ⚠️ **Future Feature**: This guide describes upcoming panel creation functionality. For current usage, see [How to create a panel (current)](#current-implementation) below.

This guide walks you through creating a new panel in the Panels system step by step.

## Prerequisites

- Access to the Panels application
- Appropriate permissions to create panels
- At least one configured data source

## Step 1: Navigate to Panel Creation

1. **Open the Panels application** in your browser
2. **Click "Create Panel"** button in the main dashboard
3. **Choose "New Panel"** from the dropdown menu

## Step 2: Configure Basic Panel Settings

### Panel Information
```typescript
// Panel configuration structure
interface PanelConfig {
  name: string
  description?: string
  dataSourceId: string
  tenantId: string
  isPublic: boolean
}
```

1. **Enter Panel Name**
   - Use a descriptive name (e.g., "Diabetes Patients - Q4 2024")
   - Keep it under 100 characters
   - Avoid special characters

2. **Add Description** (Optional)
   - Explain the panel's purpose
   - Include any relevant context
   - Consider your audience

3. **Select Data Source**
   - Choose from available data sources
   - Ensure the data source has the data you need
   - Contact your administrator if needed data sources are missing

## Step 3: Define Panel Structure

### Choose Base Query
Select the primary resource type for your panel:

- **Patients** - For patient-centered panels
- **Observations** - For lab results, vitals, assessments
- **Conditions** - For diagnosis-focused panels
- **Medications** - For medication management
- **Encounters** - For visit-based analysis

### Example: Patient Panel
```sql
-- Example base query for patient panel
SELECT DISTINCT
  p.id as patient_id,
  p.family_name,
  p.given_name,
  p.birth_date,
  p.gender
FROM patients p
WHERE p.tenant_id = :tenantId
```

## Step 4: Add Data Columns

### Core Patient Information
Always include essential patient identifiers:

1. **Patient ID** (required)
   - Data type: `string`
   - Source: `patient.id`

2. **Name** (recommended)
   - Data type: `string`
   - Source: `patient.name.family + ", " + patient.name.given`

3. **Date of Birth**
   - Data type: `date`
   - Source: `patient.birthDate`

### Clinical Data Columns
Add relevant clinical information:

1. **Most Recent A1C** (for diabetes panel)
   ```typescript
   {
     name: "Latest A1C",
     type: "number",
     source: "observation",
     filter: {
       code: "4548-4", // LOINC code for A1C
       dateRange: "last-12-months"
     },
     aggregation: "latest"
   }
   ```

2. **Current Medications**
   ```typescript
   {
     name: "Active Medications",
     type: "array",
     source: "medication",
     filter: {
       status: "active"
     }
   }
   ```

## Step 5: Configure Calculated Columns

### Basic Calculations
Add computed values to enhance your panel:

1. **Age Calculation**
   ```typescript
   {
     name: "Age",
     type: "calculated",
     formula: "DATEDIFF('year', patient.birthDate, NOW())",
     dataType: "number"
   }
   ```

2. **BMI Calculation**
   ```typescript
   {
     name: "BMI",
     type: "calculated",
     formula: "weight / (height * height) * 703",
     dataType: "number",
     dependencies: ["weight", "height"]
   }
   ```

### Healthcare-Specific Calculations
3. **Days Since Last Visit**
   ```typescript
   {
     name: "Days Since Last Visit",
     type: "calculated",
     formula: "DATEDIFF('day', MAX(encounter.date), NOW())",
     dataType: "number"
   }
   ```

## Step 6: Set Up Filtering and Sorting

### Default Filters
Configure filters that users will commonly need:

1. **Age Range Filter**
   ```typescript
   {
     type: "range",
     column: "age",
     defaultMin: 18,
     defaultMax: 100,
     userConfigurable: true
   }
   ```

2. **Condition-Based Filter**
   ```typescript
   {
     type: "condition",
     column: "conditions",
     options: [
       { value: "E11.9", label: "Type 2 Diabetes" },
       { value: "I10", label: "Hypertension" }
     ]
   }
   ```

### Default Sorting
Set up logical default sorting:
```typescript
{
  defaultSort: [
    { column: "family_name", direction: "asc" },
    { column: "given_name", direction: "asc" }
  ]
}
```

## Step 7: Configure Access and Permissions

### Panel Visibility
1. **Private Panel** - Only you can access
2. **Team Panel** - Your care team can access
3. **Organization Panel** - Anyone in your organization
4. **Public Panel** - All users (use carefully)

### Role-Based Access
```typescript
{
  permissions: {
    "care-manager": ["read", "edit"],
    "physician": ["read", "edit", "export"],
    "nurse": ["read"],
    "admin": ["read", "edit", "delete", "manage"]
  }
}
```

## Step 8: Test Your Panel

### Preview Data
1. **Click "Preview"** to see sample data
2. **Verify columns** display correctly
3. **Test filters** work as expected
4. **Check calculations** are accurate

### Validate Performance
1. **Check load time** (should be < 5 seconds)
2. **Verify data accuracy** against source system
3. **Test with different filter combinations**

### Example Test Cases
```typescript
// Test calculated columns
const testPatient = {
  birthDate: "1980-01-01",
  weight: 70, // kg
  height: 1.75 // meters
}

// Expected: Age ≈ 44, BMI ≈ 22.9
console.log("Age:", calculateAge(testPatient.birthDate))
console.log("BMI:", calculateBMI(testPatient.weight, testPatient.height))
```

## Step 9: Save and Publish

### Save Draft
1. **Click "Save Draft"** to save work in progress
2. **Add save notes** for version tracking
3. **Test thoroughly** before publishing

### Publish Panel
1. **Review all settings** one final time
2. **Click "Publish"** to make available to users
3. **Set notification preferences** for panel updates

## Step 10: Share and Collaborate

### Share with Team
1. **Copy panel URL** from the address bar
2. **Send to team members** via email or messaging
3. **Set up notifications** for panel changes

### Create Views
Help users by creating predefined views:
```typescript
{
  name: "High Risk Diabetics",
  filters: {
    conditions: ["E11.9"],
    a1c: { min: 9.0 },
    lastVisit: { daysAgo: 90 }
  }
}
```

## Troubleshooting

### Common Issues

**Q: Panel loads slowly**
- Check if you have too many calculated columns
- Consider adding indexes to source data
- Limit initial data load with default filters

**Q: Calculated columns show errors**
- Verify all referenced columns exist
- Check data types match formula expectations
- Test formulas with sample data

**Q: Missing data in columns**
- Verify data source contains expected information
- Check date ranges and filters
- Confirm FHIR mappings are correct

**Q: Permission errors**
- Verify you have panel creation permissions
- Check data source access rights
- Contact administrator for organization-level issues

## Best Practices

### Naming Conventions
- Use descriptive, consistent names
- Include date ranges when relevant
- Avoid abbreviations that might confuse users

### Performance Optimization
- Limit initial data load to recent/relevant records
- Use calculated columns sparingly
- Index frequently filtered columns

### User Experience
- Add helpful column descriptions
- Set logical default sorts and filters
- Create common views for typical use cases

### Maintenance
- Review and update panels quarterly
- Archive outdated panels
- Keep documentation updated

---

## Current Implementation

**How to create a panel with the current system**

The current implementation uses localStorage for panel storage and has a simpler interface. Here's how to create panels with the existing functionality:

### Step 1: Access Panel Creation
1. **Navigate to the home page** of the Panels application
2. **Click "Create new Panel"** button (with Plus icon)
3. **You'll be redirected** to `/panel/default` which creates a new panel

### Step 2: Configure Panel Basic Info
The current panel structure is:
```typescript
interface PanelDefinition {
  id: string
  title: string
  filters: Filter[]
  taskViewColumns: ColumnDefinition[]
  patientViewColumns: ColumnDefinition[]
  createdAt: string
  views?: ViewDefinition[]
}
```

### Step 3: Edit Panel Title
1. **Click on the panel tab** at the top
2. **The title becomes editable** - type your new panel name
3. **Press Enter** or click away to save

### Step 4: Add Columns
Currently supported column types:
```typescript
type ColumnDefinition = {
  id: string
  key: string
  name: string
  type: "string" | "number" | "date" | "boolean" | "tasks" | "select" | "array" | "assignee"
  description?: string
  source?: string
  options?: Array<{ value: string; color: string }>
}
```

1. **Click the "+" button** in the table header
2. **Configure column properties** in the add column interface
3. **Choose between Patient View or Task View** using the toggle

### Step 5: Switch Between Views
- **Patient View**: Shows patient-focused data
- **Task View**: Shows task/workflow data
- **Toggle** between views using the view switcher

### Step 6: Create Additional Views
1. **Click "New view"** button in the navigation tabs
2. **Edit the view title** by clicking on it
3. **Configure columns specific** to this view
4. **Each view maintains** its own column configuration

### Step 7: Data Persistence
- **All data is stored** in browser localStorage
- **Changes are saved** automatically as you make them
- **Data persists** between browser sessions

### Current Limitations
- No backend integration (localStorage only)
- No user authentication or tenancy
- No data source connections
- No real-time data updates
- Limited to demo/development usage

### Next Steps

- **[How to add columns](./add-columns.md)** - Add more data to your panel
- **[How to create views](./create-views.md)** - Organize your panel data
- **[Understanding the current data model](../../explanation/architecture/current-data-model.md)** - Learn the structure

## Related Topics

- **[Understanding Panels vs Views](../../explanation/concepts/panels-vs-views.md)** - Learn the difference
- **[Panel API Reference](../../reference/backend-api/panels/)** - Technical details
- **[Data Source Configuration](../../guides/data-sources/connect-fhir.md)** - Connect your data 