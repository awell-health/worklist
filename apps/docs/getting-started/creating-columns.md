# Creating Columns

Congratulations! Your panel now has data sources feeding in raw data. Time to structure that data with **columns** - the foundation of how your users will interact with the information.

## What You'll Learn

By the end of this tutorial, you'll know how to:
- ✅ Create base columns from your data sources
- ✅ Build calculated columns with custom formulas
- ✅ Configure column display and formatting
- ✅ Set up validation and data types
- ✅ Manage column ordering and visibility

## Prerequisites

- ✅ Completed [Adding Data Sources](./adding-data-sources.md)
- ✅ Have a panel with at least one data source
- ✅ Data source has been synchronized with data

## Understanding Columns

Think of **columns** as the blueprint for how your data appears in the panel:

### Base Columns
- 📋 **Direct mappings** from your data source fields
- 🎯 **Simple display** of existing data
- 🔄 **Automatically sync** when data source updates
- 🛡️ **Data validation** and type enforcement

### Calculated Columns  
- 🧮 **Formula-driven** values computed from other columns
- 🔄 **Dynamic updates** when dependent data changes
- 📊 **Custom logic** for business rules and transformations
- 🎨 **Rich expressions** supporting math, text, dates, and logic

## Step 1: Your First Base Column

Let's start by creating base columns from your data source:

\`\`\`typescript
// columns-demo.ts
import { panelsAPI } from '@panels/app/api'

// Use your panel ID from previous tutorials
const PANEL_ID = "123" // Replace with your actual panel ID
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

console.log("Starting columns tutorial...")
\`\`\`

### List Available Data Source Fields

First, let's see what fields are available from our data sources:

\`\`\`typescript
async function exploreDataSourceFields() {
  try {
    console.log("🔍 Exploring available data source fields...")
    
    // Get data sources for the panel
    const dataSources = await panelsAPI.dataSources.list(
      PANEL_ID,
      TENANT_ID,
      USER_ID
    )

    console.log(`📊 Found ${dataSources.length} data source(s):`)
    
    dataSources.forEach((ds, index) => {
      console.log(`   ${index + 1}. ${ds.type} Data Source (ID: ${ds.id})`)
      
      // In a real implementation, you'd inspect the actual data
      // For this demo, we'll assume common fields
      if (ds.type === 'database') {
        console.log("      Available fields: id, name, email, created_at, status")
      } else if (ds.type === 'api') {
        console.log("      Available fields: id, username, email, phone, website")
      }
    })
    
    return dataSources
  } catch (error) {
    console.error("❌ Failed to explore data sources:", error)
    throw error
  }
}

// Explore available fields
const dataSources = await exploreDataSourceFields()
\`\`\`

### Create Your First Base Column

Let's create a base column for displaying user names:

\`\`\`typescript
async function createBaseColumn() {
  try {
    console.log("📋 Creating base column...")
    
    const nameColumn = await panelsAPI.columns.createBase(PANEL_ID, {
      title: "Full Name",
      description: "User's full name from the database",
      sourceField: "name",
      dataType: "text",
      displaySettings: {
        width: 200,
        alignment: "left",
        sortable: true,
        filterable: true
      },
      validation: {
        required: true,
        maxLength: 100
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Base column created!")
    console.log(`   Column ID: ${nameColumn.id}`)
    console.log(`   Title: ${nameColumn.title}`)
    console.log(`   Source Field: ${nameColumn.sourceField}`)
    console.log(`   Data Type: ${nameColumn.dataType}`)
    
    return nameColumn
  } catch (error) {
    console.error("❌ Failed to create base column:", error)
    throw error
  }
}

// Create base column
const nameColumn = await createBaseColumn()
\`\`\`

### Create Multiple Base Columns

Let's add several more base columns to build out our panel structure:

\`\`\`typescript
async function createMultipleBaseColumns() {
  try {
    console.log("📋 Creating multiple base columns...")
    
    // Email column
    const emailColumn = await panelsAPI.columns.createBase(PANEL_ID, {
      title: "Email Address",
      description: "User's primary email address",
      sourceField: "email",
      dataType: "email",
      displaySettings: {
        width: 250,
        alignment: "left",
        sortable: true,
        filterable: true
      },
      validation: {
        required: true,
        pattern: "^[^@]+@[^@]+\\.[^@]+$"
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    
    // Status column
    const statusColumn = await panelsAPI.columns.createBase(PANEL_ID, {
      title: "Account Status",
      description: "Current status of the user account",
      sourceField: "status",
      dataType: "select",
      displaySettings: {
        width: 120,
        alignment: "center",
        sortable: true,
        filterable: true
      },
      selectOptions: [
        { value: "active", label: "Active", color: "green" },
        { value: "inactive", label: "Inactive", color: "gray" },
        { value: "pending", label: "Pending", color: "yellow" },
        { value: "suspended", label: "Suspended", color: "red" }
      ],
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    
    // Created date column
    const createdColumn = await panelsAPI.columns.createBase(PANEL_ID, {
      title: "Created Date",
      description: "When the user account was created",
      sourceField: "created_at",
      dataType: "datetime",
      displaySettings: {
        width: 180,
        alignment: "left",
        sortable: true,
        filterable: true,
        dateFormat: "MMM dd, yyyy"
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Created 3 additional base columns!")
    console.log(`   📧 Email: ${emailColumn.title}`)
    console.log(`   🎯 Status: ${statusColumn.title}`)
    console.log(`   📅 Created: ${createdColumn.title}`)
    
    return [emailColumn, statusColumn, createdColumn]
  } catch (error) {
    console.error("❌ Failed to create base columns:", error)
    throw error
  }
}

// Create additional columns
const [emailColumn, statusColumn, createdColumn] = await createMultipleBaseColumns()
\`\`\`

## Step 2: Your First Calculated Column

Now let's create calculated columns that derive values from your base columns:

### Simple Text Calculated Column

\`\`\`typescript
async function createTextCalculatedColumn() {
  try {
    console.log("🧮 Creating text calculated column...")
    
    const displayNameColumn = await panelsAPI.columns.createCalculated(PANEL_ID, {
      title: "Display Name",
      description: "Formatted display name with email",
      formula: `CONCAT([Full Name], " (", [Email Address], ")")`,
      dataType: "text",
      displaySettings: {
        width: 300,
        alignment: "left",
        sortable: true,
        filterable: false
      },
      dependencies: ["Full Name", "Email Address"], // Column titles it depends on
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Text calculated column created!")
    console.log(`   Column ID: ${displayNameColumn.id}`)
    console.log(`   Title: ${displayNameColumn.title}`)
    console.log(`   Formula: ${displayNameColumn.formula}`)
    
    return displayNameColumn
  } catch (error) {
    console.error("❌ Failed to create calculated column:", error)
    throw error
  }
}

// Create calculated column
const displayNameColumn = await createTextCalculatedColumn()
\`\`\`

### Date-Based Calculated Column

\`\`\`typescript
async function createDateCalculatedColumn() {
  try {
    console.log("📅 Creating date calculated column...")
    
    const accountAgeColumn = await panelsAPI.columns.createCalculated(PANEL_ID, {
      title: "Account Age (Days)",
      description: "Number of days since account creation",
      formula: `DATEDIFF(NOW(), [Created Date])`,
      dataType: "number",
      displaySettings: {
        width: 150,
        alignment: "right",
        sortable: true,
        filterable: true,
        numberFormat: "0"
      },
      dependencies: ["Created Date"],
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Date calculated column created!")
    console.log(`   Column ID: ${accountAgeColumn.id}`)
    console.log(`   Formula: ${accountAgeColumn.formula}`)
    
    return accountAgeColumn
  } catch (error) {
    console.error("❌ Failed to create date calculated column:", error)
    throw error
  }
}

// Create date calculated column
const accountAgeColumn = await createDateCalculatedColumn()
\`\`\`

### Conditional Logic Calculated Column

\`\`\`typescript
async function createConditionalCalculatedColumn() {
  try {
    console.log("🔀 Creating conditional calculated column...")
    
    const statusLabelColumn = await panelsAPI.columns.createCalculated(PANEL_ID, {
      title: "Status Label",
      description: "Friendly status label with emoji",
      formula: `
        IF([Account Status] = "active", "✅ Active User",
        IF([Account Status] = "pending", "⏳ Pending Approval", 
        IF([Account Status] = "suspended", "🚫 Suspended",
        "❌ Inactive")))
      `,
      dataType: "text",
      displaySettings: {
        width: 180,
        alignment: "center",
        sortable: true,
        filterable: true
      },
      dependencies: ["Account Status"],
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Conditional calculated column created!")
    console.log(`   Column ID: ${statusLabelColumn.id}`)
    console.log(`   Dependencies: ${statusLabelColumn.dependencies.join(", ")}`)
    
    return statusLabelColumn
  } catch (error) {
    console.error("❌ Failed to create conditional calculated column:", error)
    throw error
  }
}

// Create conditional column
const statusLabelColumn = await createConditionalCalculatedColumn()
\`\`\`

## Step 3: Column Management

Let's learn how to list, update, and organize our columns:

### List All Columns

\`\`\`typescript
async function listAllColumns() {
  try {
    console.log("📊 Listing all panel columns...")
    
    const columns = await panelsAPI.columns.list(
      PANEL_ID,
      TENANT_ID,
      USER_ID
    )

    console.log(`📋 Panel has ${columns.length} column(s):`)
    console.log("=".repeat(60))
    
    columns.forEach((column, index) => {
      const isCalculated = column.type === 'calculated'
      const icon = isCalculated ? "🧮" : "📋"
      
      console.log(`${icon} ${index + 1}. ${column.title}`)
      console.log(`   Type: ${column.type}`)
      console.log(`   Data Type: ${column.dataType}`)
      
      if (isCalculated) {
        console.log(`   Formula: ${column.formula}`)
        console.log(`   Dependencies: ${column.dependencies?.join(", ") || "None"}`)
      } else {
        console.log(`   Source Field: ${column.sourceField}`)
      }
      
      console.log(`   Width: ${column.displaySettings?.width || "Auto"}px`)
      console.log("")
    })
    
    return columns
  } catch (error) {
    console.error("❌ Failed to list columns:", error)
    throw error
  }
}

// List all columns
const allColumns = await listAllColumns()
\`\`\`

### Update Column Configuration

\`\`\`typescript
async function updateColumnConfig() {
  try {
    console.log("⚙️ Updating column configuration...")
    
    // Update the name column to be wider and add better validation
    const updatedNameColumn = await panelsAPI.columns.update(
      PANEL_ID,
      nameColumn.id,
      {
        displaySettings: {
          ...nameColumn.displaySettings,
          width: 250, // Increase width
          placeholder: "Enter full name..."
        },
        validation: {
          ...nameColumn.validation,
          minLength: 2, // Add minimum length
          customMessage: "Please enter a valid full name (2+ characters)"
        }
      },
      TENANT_ID,
      USER_ID
    )

    console.log("✅ Column configuration updated!")
    console.log(`   Column: ${updatedNameColumn.title}`)
    console.log(`   New Width: ${updatedNameColumn.displaySettings.width}px`)
    
    return updatedNameColumn
  } catch (error) {
    console.error("❌ Failed to update column:", error)
    throw error
  }
}

// Update column
const updatedNameColumn = await updateColumnConfig()
\`\`\`

## Step 4: Advanced Column Types

Let's explore some advanced column configurations:

### Number Column with Formatting

\`\`\`typescript
async function createNumberColumn() {
  try {
    console.log("🔢 Creating formatted number column...")
    
    const scoreColumn = await panelsAPI.columns.createCalculated(PANEL_ID, {
      title: "User Score",
      description: "Calculated user engagement score",
      formula: `
        ([Account Age (Days)] * 0.1) + 
        IF([Account Status] = "active", 100, 0) +
        RANDOM() * 50
      `,
      dataType: "number",
      displaySettings: {
        width: 120,
        alignment: "right",
        sortable: true,
        filterable: true,
        numberFormat: "0.00", // 2 decimal places
        prefix: "",
        suffix: " pts"
      },
      dependencies: ["Account Age (Days)", "Account Status"],
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Number column created with formatting!")
    console.log(`   Format: ${scoreColumn.displaySettings.numberFormat}`)
    console.log(`   Suffix: ${scoreColumn.displaySettings.suffix}`)
    
    return scoreColumn
  } catch (error) {
    console.error("❌ Failed to create number column:", error)
    throw error
  }
}

// Create number column
const scoreColumn = await createNumberColumn()
\`\`\`

### URL/Link Column

\`\`\`typescript
async function createLinkColumn() {
  try {
    console.log("🔗 Creating link column...")
    
    const profileLinkColumn = await panelsAPI.columns.createCalculated(PANEL_ID, {
      title: "Profile Link",
      description: "Link to user profile page",
      formula: `CONCAT("/users/", REPLACE([Email Address], "@", "-at-"))`,
      dataType: "url",
      displaySettings: {
        width: 150,
        alignment: "center",
        sortable: false,
        filterable: false,
        linkText: "View Profile",
        openInNewTab: true
      },
      dependencies: ["Email Address"],
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Link column created!")
    console.log(`   Link Text: ${profileLinkColumn.displaySettings.linkText}`)
    console.log(`   Opens in new tab: ${profileLinkColumn.displaySettings.openInNewTab}`)
    
    return profileLinkColumn
  } catch (error) {
    console.error("❌ Failed to create link column:", error)
    throw error
  }
}

// Create link column
const profileLinkColumn = await createLinkColumn()
\`\`\`

## Step 5: Column Ordering and Organization

Let's organize our columns in a logical order:

\`\`\`typescript
async function organizeColumns() {
  try {
    console.log("📐 Organizing column order...")
    
    // Get current columns
    const columns = await panelsAPI.columns.list(PANEL_ID, TENANT_ID, USER_ID)
    
    // Define desired order by column titles
    const desiredOrder = [
      "Full Name",
      "Display Name", 
      "Email Address",
      "Account Status",
      "Status Label",
      "Created Date",
      "Account Age (Days)",
      "User Score",
      "Profile Link"
    ]
    
    // Update column positions
    for (let i = 0; i < desiredOrder.length; i++) {
      const columnTitle = desiredOrder[i]
      const column = columns.find(col => col.title === columnTitle)
      
      if (column) {
        await panelsAPI.columns.update(
          PANEL_ID,
          column.id,
          {
            displaySettings: {
              ...column.displaySettings,
              order: i + 1
            }
          },
          TENANT_ID,
          USER_ID
        )
        
        console.log(`   📍 ${columnTitle}: Position ${i + 1}`)
      }
    }
    
    console.log("✅ Column organization completed!")
    
  } catch (error) {
    console.error("❌ Failed to organize columns:", error)
    throw error
  }
}

// Organize columns
await organizeColumns()
\`\`\`

## Complete Column Creation Workflow

Here's a complete example that creates a full set of columns:

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'

const PANEL_ID = "123" // Your panel ID
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

async function createCompleteColumnSet() {
  console.log("🚀 Creating Complete Column Set\n")
  
  try {
    // 1. Create base columns
    console.log("1️⃣ Creating base columns...")
    
    const baseColumns = await Promise.all([
      // Name column
      panelsAPI.columns.createBase(PANEL_ID, {
        title: "Full Name",
        sourceField: "name",
        dataType: "text",
        displaySettings: { width: 200, sortable: true },
        validation: { required: true, maxLength: 100 },
        tenantId: TENANT_ID,
        userId: USER_ID
      }),
      
      // Email column
      panelsAPI.columns.createBase(PANEL_ID, {
        title: "Email",
        sourceField: "email", 
        dataType: "email",
        displaySettings: { width: 250, sortable: true },
        validation: { required: true },
        tenantId: TENANT_ID,
        userId: USER_ID
      }),
      
      // Status column
      panelsAPI.columns.createBase(PANEL_ID, {
        title: "Status",
        sourceField: "status",
        dataType: "select",
        displaySettings: { width: 120, alignment: "center" },
        selectOptions: [
          { value: "active", label: "Active", color: "green" },
          { value: "inactive", label: "Inactive", color: "gray" }
        ],
        tenantId: TENANT_ID,
        userId: USER_ID
      })
    ])
    
    console.log(`   ✅ Created ${baseColumns.length} base columns\n`)
    
    // 2. Create calculated columns
    console.log("2️⃣ Creating calculated columns...")
    
    const calculatedColumns = await Promise.all([
      // Display name
      panelsAPI.columns.createCalculated(PANEL_ID, {
        title: "Display Name",
        formula: `CONCAT([Full Name], " <", [Email], ">")`,
        dataType: "text",
        displaySettings: { width: 300 },
        dependencies: ["Full Name", "Email"],
        tenantId: TENANT_ID,
        userId: USER_ID
      }),
      
      // Status badge
      panelsAPI.columns.createCalculated(PANEL_ID, {
        title: "Status Badge",
        formula: `IF([Status] = "active", "✅ Active", "❌ Inactive")`,
        dataType: "text",
        displaySettings: { width: 120, alignment: "center" },
        dependencies: ["Status"],
        tenantId: TENANT_ID,
        userId: USER_ID
      })
    ])
    
    console.log(`   ✅ Created ${calculatedColumns.length} calculated columns\n`)
    
    // 3. Verify final column set
    console.log("3️⃣ Verifying final column set...")
    const allColumns = await panelsAPI.columns.list(PANEL_ID, TENANT_ID, USER_ID)
    
    console.log(`📊 Panel now has ${allColumns.length} columns:`)
    allColumns.forEach((col, i) => {
      const type = col.type === 'calculated' ? '🧮' : '📋'
      console.log(`   ${type} ${col.title} (${col.dataType})`)
    })
    
    console.log("\n🎉 Column creation completed!")
    console.log("   Next: Build views to display your data")
    
  } catch (error) {
    console.error("💥 Column creation failed:", error.message)
    throw error
  }
}

// Run the complete workflow
createCompleteColumnSet()
  .then(() => {
    console.log("\n🎯 Ready for the next step: Building Views!")
  })
  .catch(error => {
    console.error("\n💥 Setup failed:", error.message)
  })
\`\`\`

## Column Configuration Reference

### Data Types

| Type | Description | Use Cases |
|------|-------------|-----------|
| `text` | Plain text strings | Names, descriptions, IDs |
| `number` | Numerical values | Scores, counts, measurements |
| `email` | Email addresses | Contact information |
| `url` | Web links | Profile links, external resources |
| `datetime` | Date and time values | Created dates, timestamps |
| `boolean` | True/false values | Feature flags, status indicators |
| `select` | Dropdown options | Status, categories, tags |
| `json` | Structured data | Configuration, metadata |

### Display Settings

\`\`\`typescript
interface DisplaySettings {
  width?: number              // Column width in pixels
  alignment?: 'left' | 'center' | 'right'
  sortable?: boolean          // Enable sorting
  filterable?: boolean        // Enable filtering
  visible?: boolean           // Show/hide column
  order?: number              // Display order
  
  // Text formatting
  placeholder?: string        // Input placeholder
  maxLength?: number          // Character limit
  
  // Number formatting
  numberFormat?: string       // e.g., "0.00", "#,##0"
  prefix?: string             // e.g., "$"
  suffix?: string             // e.g., "%"
  
  // Date formatting
  dateFormat?: string         // e.g., "MMM dd, yyyy"
  timeFormat?: string         // e.g., "HH:mm"
  
  // Link settings
  linkText?: string           // Display text for links
  openInNewTab?: boolean      // Link behavior
}
\`\`\`

### Validation Rules

\`\`\`typescript
interface ValidationRules {
  required?: boolean          // Field is required
  minLength?: number          // Minimum text length
  maxLength?: number          // Maximum text length
  pattern?: string            // Regex pattern
  min?: number                // Minimum number value
  max?: number                // Maximum number value
  customMessage?: string      // Custom error message
}
\`\`\`

## Formula Functions Reference

### Text Functions
- `CONCAT(text1, text2, ...)` - Combine text strings
- `UPPER(text)` - Convert to uppercase
- `LOWER(text)` - Convert to lowercase
- `REPLACE(text, find, replace)` - Replace text
- `SUBSTRING(text, start, length)` - Extract text portion

### Math Functions
- `SUM(numbers...)` - Add numbers
- `AVERAGE(numbers...)` - Calculate average
- `ROUND(number, decimals)` - Round number
- `ABS(number)` - Absolute value
- `RANDOM()` - Random number 0-1

### Date Functions
- `NOW()` - Current date/time
- `DATEDIFF(date1, date2)` - Days between dates
- `DATEADD(date, days)` - Add days to date
- `YEAR(date)`, `MONTH(date)`, `DAY(date)` - Extract date parts

### Logic Functions
- `IF(condition, true_value, false_value)` - Conditional logic
- `AND(condition1, condition2, ...)` - Logical AND
- `OR(condition1, condition2, ...)` - Logical OR
- `NOT(condition)` - Logical NOT

## Troubleshooting

### Common Issues

**Column Not Displaying:**
\`\`\`typescript
// Check if column is visible
const column = await panelsAPI.columns.get(panelId, columnId, tenantId, userId)
console.log("Visible:", column.displaySettings?.visible !== false)

// Check column order
console.log("Order:", column.displaySettings?.order || "No order set")
\`\`\`

**Formula Errors:**
\`\`\`typescript
// Verify column dependencies exist
const dependencies = column.dependencies || []
console.log("Dependencies:", dependencies)

// Check for circular references
// Make sure columns don't depend on themselves
\`\`\`

**Data Type Mismatches:**
\`\`\`typescript
// Ensure source field matches expected data type
// Use appropriate formatting for display
// Validate formula output matches column data type
\`\`\`

## Next Steps

Fantastic! Your panel now has a rich column structure. Here's what comes next:

🎯 **Immediate Next Steps:**
- [Building Views →](./building-views.md) - Create filtered and sorted views
- [Next Steps →](./next-steps.md) - Your learning roadmap

🔗 **Related Guides:**
- [Column Formulas](/guides/panels/column-formulas.md) - Advanced formula techniques
- [Data Validation](/guides/panels/data-validation.md) - Input validation patterns
- [Custom Display](/guides/panels/custom-display.md) - Advanced display formatting

🛠️ **Advanced Topics:**
- [Column Types Reference](/reference/schemas/column-types.md) - Complete reference
- [Formula Functions](/reference/schemas/formula-functions.md) - All available functions
- [Performance Tips](/guides/panels/performance-tips.md) - Optimizing calculated columns

## Summary

In this tutorial, you learned how to:

✅ **Create Base Columns** - Map data source fields to display columns  
✅ **Build Calculated Columns** - Use formulas for dynamic values  
✅ **Configure Display Settings** - Control appearance and behavior  
✅ **Set Up Validation Rules** - Ensure data quality and integrity  
✅ **Organize Column Layout** - Order and structure your panel display  
✅ **Use Advanced Features** - Links, formatting, and conditional logic

Your panel now has structured, meaningful columns that transform raw data into actionable information!
