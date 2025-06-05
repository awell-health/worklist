# Building Views

Perfect! Your panel now has data sources feeding in information and columns structuring that data. Time to create **views** - the final piece that makes your data useful and actionable for different audiences.

## What You'll Learn

By the end of this tutorial, you'll know how to:
- ✅ Create custom filtered views of your data
- ✅ Set up sorting and organization
- ✅ Configure view-specific column visibility
- ✅ Publish views for different user groups
- ✅ Manage view permissions and access

## Prerequisites

- ✅ Completed [Creating Columns](./creating-columns.md)
- ✅ Have a panel with data sources and columns configured
- ✅ Column data is populated and visible

## Understanding Views

**Views** are customized presentations of your panel data:

### Core Concepts
- 🎯 **Filtered subsets** of your panel data
- 📊 **Custom sorting** and organization
- 👁️ **Column visibility** control per view
- 🔐 **Permission-based** access control
- 📱 **Responsive layouts** for different devices

### View Types
- **Default View**: The primary panel view with all data
- **Filtered Views**: Specific subsets (e.g., "Active Users Only")
- **Sorted Views**: Data organized by specific criteria
- **Role-based Views**: Customized for different user types

## Step 1: Your First Custom View

Let's start by creating a view for active users only:

```typescript
// views-demo.ts
import { viewsAPI } from '@panels/app/api'

// Use your panel ID from previous tutorials
const PANEL_ID = "123" // Replace with your actual panel ID
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

console.log("Starting views tutorial...")
```

### Create a Filtered View

```typescript
async function createActiveUsersView() {
  try {
    console.log("🎯 Creating active users view...")
    
    const activeUsersView = await viewsAPI.create(PANEL_ID, {
      title: "Active Users",
      description: "View showing only active user accounts",
      filters: [
        {
          columnTitle: "Account Status",
          operator: "equals",
          value: "active"
        }
      ],
      sorting: [
        {
          columnTitle: "Created Date",
          direction: "desc" // Newest first
        }
      ],
      columnVisibility: {
        "Full Name": true,
        "Email Address": true,
        "Account Status": true,
        "Status Label": false, // Hide redundant label
        "Created Date": true,
        "Account Age (Days)": true,
        "User Score": true,
        "Profile Link": true,
        "Display Name": false // Hide calculated display name
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Active users view created!")
    console.log(`   View ID: ${activeUsersView.id}`)
    console.log(`   Title: ${activeUsersView.title}`)
    console.log(`   Filters: ${activeUsersView.filters.length}`)
    console.log(`   Sorting: ${activeUsersView.sorting.length}`)
    
    return activeUsersView
  } catch (error) {
    console.error("❌ Failed to create active users view:", error)
    throw error
  }
}

// Create the view
const activeUsersView = await createActiveUsersView()
```

### Create a New Users View

Let's create another view for recently created accounts:

```typescript
async function createNewUsersView() {
  try {
    console.log("🆕 Creating new users view...")
    
    const newUsersView = await viewsAPI.create(PANEL_ID, {
      title: "New Users (Last 30 Days)",
      description: "Recently created user accounts",
      filters: [
        {
          columnTitle: "Account Age (Days)",
          operator: "lessThanOrEqual",
          value: 30
        }
      ],
      sorting: [
        {
          columnTitle: "Created Date", 
          direction: "desc" // Newest first
        },
        {
          columnTitle: "User Score",
          direction: "desc" // Highest scores first (secondary sort)
        }
      ],
      columnVisibility: {
        "Full Name": true,
        "Email Address": true,
        "Account Status": true,
        "Status Label": true, // Show status labels for new users
        "Created Date": true,
        "Account Age (Days)": true,
        "User Score": false, // Less relevant for new users
        "Profile Link": true,
        "Display Name": false
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ New users view created!")
    console.log(`   View ID: ${newUsersView.id}`)
    console.log(`   Title: ${newUsersView.title}`)
    console.log(`   Age Filter: ≤ 30 days`)
    
    return newUsersView
  } catch (error) {
    console.error("❌ Failed to create new users view:", error)
    throw error
  }
}

// Create new users view
const newUsersView = await createNewUsersView()
```

## Step 2: Advanced View Configuration

Let's create more sophisticated views with multiple filters and complex sorting:

### High-Value Users View

```typescript
async function createHighValueUsersView() {
  try {
    console.log("💎 Creating high-value users view...")
    
    const highValueView = await viewsAPI.create(PANEL_ID, {
      title: "High-Value Users",
      description: "Active users with high engagement scores",
      filters: [
        {
          columnTitle: "Account Status",
          operator: "equals",
          value: "active"
        },
        {
          columnTitle: "User Score",
          operator: "greaterThan",
          value: 75
        },
        {
          columnTitle: "Account Age (Days)",
          operator: "greaterThan",
          value: 7 // At least a week old
        }
      ],
      sorting: [
        {
          columnTitle: "User Score",
          direction: "desc" // Highest scores first
        },
        {
          columnTitle: "Account Age (Days)",
          direction: "desc" // Older accounts second
        }
      ],
      columnVisibility: {
        "Full Name": true,
        "Email Address": true,
        "Account Status": false, // All active, no need to show
        "Status Label": false,
        "Created Date": true,
        "Account Age (Days)": true,
        "User Score": true, // Key metric
        "Profile Link": true,
        "Display Name": true // Show formatted names
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ High-value users view created!")
    console.log(`   Filters: Status=active, Score>75, Age>7 days`)
    console.log(`   Sorting: Score DESC, Age DESC`)
    
    return highValueView
  } catch (error) {
    console.error("❌ Failed to create high-value users view:", error)
    throw error
  }
}

// Create high-value view
const highValueView = await createHighValueUsersView()
```

### Problem Users View

```typescript
async function createProblemUsersView() {
  try {
    console.log("⚠️ Creating problem users view...")
    
    const problemUsersView = await viewsAPI.create(PANEL_ID, {
      title: "Users Needing Attention",
      description: "Suspended users and old pending accounts",
      filters: [
        {
          // Using OR logic for multiple conditions
          logicalOperator: "OR",
          conditions: [
            {
              columnTitle: "Account Status",
              operator: "equals",
              value: "suspended"
            },
            {
              logicalOperator: "AND",
              conditions: [
                {
                  columnTitle: "Account Status", 
                  operator: "equals",
                  value: "pending"
                },
                {
                  columnTitle: "Account Age (Days)",
                  operator: "greaterThan",
                  value: 7 // Pending for more than a week
                }
              ]
            }
          ]
        }
      ],
      sorting: [
        {
          columnTitle: "Account Status",
          direction: "asc" // Suspended first
        },
        {
          columnTitle: "Account Age (Days)", 
          direction: "desc" // Oldest problems first
        }
      ],
      columnVisibility: {
        "Full Name": true,
        "Email Address": true,
        "Account Status": true, // Important to see status
        "Status Label": true, // Visual status indicators
        "Created Date": true,
        "Account Age (Days)": true,
        "User Score": false, // Not relevant for problem users
        "Profile Link": true,
        "Display Name": false
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Problem users view created!")
    console.log("   Logic: Suspended OR (Pending AND Age > 7 days)")
    
    return problemUsersView
  } catch (error) {
    console.error("❌ Failed to create problem users view:", error)
    throw error
  }
}

// Create problem users view
const problemUsersView = await createProblemUsersView()
```

## Step 3: View Management

Let's learn how to list, update, and organize our views:

### List All Views

```typescript
async function listAllViews() {
  try {
    console.log("📋 Listing all panel views...")
    
    const views = await viewsAPI.list(PANEL_ID, TENANT_ID, USER_ID)

    console.log(`🎯 Panel has ${views.length} view(s):`)
    console.log("=".repeat(60))
    
    views.forEach((view, index) => {
      console.log(`📊 ${index + 1}. ${view.title}`)
      console.log(`   Description: ${view.description}`)
      console.log(`   Filters: ${view.filters?.length || 0}`)
      console.log(`   Sorting: ${view.sorting?.length || 0} criteria`)
      
      // Count visible columns
      const visibleColumns = Object.values(view.columnVisibility || {})
        .filter(visible => visible).length
      console.log(`   Visible Columns: ${visibleColumns}`)
      
      console.log(`   Published: ${view.isPublished ? "Yes" : "No"}`)
      console.log("")
    })
    
    return views
  } catch (error) {
    console.error("❌ Failed to list views:", error)
    throw error
  }
}

// List all views
const allViews = await listAllViews()
```

### Update View Configuration

```typescript
async function updateViewConfig() {
  try {
    console.log("⚙️ Updating view configuration...")
    
    // Update the active users view to include more sorting
    const updatedView = await viewsAPI.update(
      PANEL_ID,
      activeUsersView.id,
      {
        sorting: [
          {
            columnTitle: "User Score",
            direction: "desc" // Add score sorting
          },
          {
            columnTitle: "Created Date",
            direction: "desc" // Keep date sorting as secondary
          }
        ],
        columnVisibility: {
          ...activeUsersView.columnVisibility,
          "User Score": true // Show scores now that we're sorting by them
        }
      },
      TENANT_ID,
      USER_ID
    )

    console.log("✅ View configuration updated!")
    console.log(`   View: ${updatedView.title}`)
    console.log(`   New Sorting: Score DESC, Date DESC`)
    
    return updatedView
  } catch (error) {
    console.error("❌ Failed to update view:", error)
    throw error
  }
}

// Update view
const updatedActiveView = await updateViewConfig()
```

## Step 4: Publishing Views

Now let's publish our views to make them available to users:

### Publish Individual Views

```typescript
async function publishViews() {
  try {
    console.log("📢 Publishing views...")
    
    // Publish the active users view for general use
    await viewsAPI.publish(
      PANEL_ID,
      activeUsersView.id,
      {
        publishedTitle: "Active Users", // Public facing title
        description: "View all active user accounts",
        permissions: ["read"], // Users can view but not edit
        userGroups: ["managers", "support"], // Who can access
        isDefault: false
      },
      TENANT_ID,
      USER_ID
    )
    
    console.log("✅ Active Users view published!")
    console.log("   Available to: managers, support")
    
    // Publish the high-value users view for managers only
    await viewsAPI.publish(
      PANEL_ID,
      highValueView.id,
      {
        publishedTitle: "High-Value Users",
        description: "Users with high engagement scores",
        permissions: ["read"],
        userGroups: ["managers"], // Restricted access
        isDefault: false
      },
      TENANT_ID,
      USER_ID
    )
    
    console.log("✅ High-Value Users view published!")
    console.log("   Available to: managers only")
    
    // Publish problem users view with edit permissions
    await viewsAPI.publish(
      PANEL_ID,
      problemUsersView.id,
      {
        publishedTitle: "Users Needing Attention", 
        description: "Accounts requiring review or action",
        permissions: ["read", "edit"], // Can modify user status
        userGroups: ["admins", "support"],
        isDefault: false
      },
      TENANT_ID,
      USER_ID
    )
    
    console.log("✅ Problem Users view published!")
    console.log("   Available to: admins, support")
    console.log("   Permissions: read, edit")
    
  } catch (error) {
    console.error("❌ Failed to publish views:", error)
    throw error
  }
}

// Publish views
await publishViews()
```

### Set Default View

```typescript
async function setDefaultView() {
  try {
    console.log("🏠 Setting default view...")
    
    // Make active users the default view for most users
    await viewsAPI.publish(
      PANEL_ID,
      activeUsersView.id,
      {
        publishedTitle: "Active Users",
        description: "Default view showing active user accounts",
        permissions: ["read"],
        userGroups: ["managers", "support", "viewers"],
        isDefault: true // This will be the default view
      },
      TENANT_ID,
      USER_ID
    )
    
    console.log("✅ Default view set!")
    console.log("   Default: Active Users view")
    console.log("   Available to: managers, support, viewers")
    
  } catch (error) {
    console.error("❌ Failed to set default view:", error)
    throw error
  }
}

// Set default view
await setDefaultView()
```

## Step 5: Advanced View Features

Let's explore some advanced view capabilities:

### View with Custom Sorting

```typescript
async function createCustomSortingView() {
  try {
    console.log("📊 Creating view with advanced sorting...")
    
    const sortedView = await viewsAPI.create(PANEL_ID, {
      title: "Users by Engagement",
      description: "All users sorted by multiple engagement metrics",
      sorting: [
        {
          columnTitle: "Account Status",
          direction: "asc", // Active first, then others
          customOrder: ["active", "pending", "inactive", "suspended"]
        },
        {
          columnTitle: "User Score",
          direction: "desc" // High scores first within each status
        },
        {
          columnTitle: "Account Age (Days)",
          direction: "desc" // Older accounts as tiebreaker
        }
      ],
      columnVisibility: {
        "Full Name": true,
        "Email Address": true,
        "Account Status": true,
        "Status Label": true,
        "Created Date": false, // Age is more relevant
        "Account Age (Days)": true,
        "User Score": true,
        "Profile Link": true,
        "Display Name": false
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Advanced sorting view created!")
    console.log("   Sort: Status (custom order) → Score DESC → Age DESC")
    
    return sortedView
  } catch (error) {
    console.error("❌ Failed to create custom sorting view:", error)
    throw error
  }
}

// Create custom sorting view
const sortedView = await createCustomSortingView()
```

## Complete Views Workflow

Here's a complete example that creates a full set of views:

```typescript
import { viewsAPI } from '@panels/app/api'

const PANEL_ID = "123" // Your panel ID
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

async function createCompleteViewSet() {
  console.log("🚀 Creating Complete View Set\n")
  
  try {
    // 1. Create core views
    console.log("1️⃣ Creating core views...")
    
    const coreViews = await Promise.all([
      // All users view (default)
      viewsAPI.create(PANEL_ID, {
        title: "All Users",
        description: "Complete list of all users",
        sorting: [{ columnTitle: "Created Date", direction: "desc" }],
        tenantId: TENANT_ID,
        userId: USER_ID
      }),
      
      // Active users view
      viewsAPI.create(PANEL_ID, {
        title: "Active Users",
        description: "Active user accounts only",
        filters: [{ columnTitle: "Account Status", operator: "equals", value: "active" }],
        sorting: [{ columnTitle: "User Score", direction: "desc" }],
        tenantId: TENANT_ID,
        userId: USER_ID
      }),
      
      // Recent users view
      viewsAPI.create(PANEL_ID, {
        title: "Recent Users",
        description: "Users created in the last 7 days",
        filters: [{ columnTitle: "Account Age (Days)", operator: "lessThanOrEqual", value: 7 }],
        sorting: [{ columnTitle: "Created Date", direction: "desc" }],
        tenantId: TENANT_ID,
        userId: USER_ID
      })
    ])
    
    console.log(`   ✅ Created ${coreViews.length} core views\n`)
    
    // 2. Create specialized views
    console.log("2️⃣ Creating specialized views...")
    
    const specializedViews = await Promise.all([
      // High performers view
      viewsAPI.create(PANEL_ID, {
        title: "Top Performers",
        description: "Users with highest engagement scores",
        filters: [
          { columnTitle: "Account Status", operator: "equals", value: "active" },
          { columnTitle: "User Score", operator: "greaterThan", value: 80 }
        ],
        sorting: [{ columnTitle: "User Score", direction: "desc" }],
        tenantId: TENANT_ID,
        userId: USER_ID
      }),
      
      // Action needed view
      viewsAPI.create(PANEL_ID, {
        title: "Action Required",
        description: "Accounts needing attention",
        filters: [
          {
            logicalOperator: "OR",
            conditions: [
              { columnTitle: "Account Status", operator: "equals", value: "suspended" },
              { columnTitle: "Account Status", operator: "equals", value: "pending" }
            ]
          }
        ],
        sorting: [{ columnTitle: "Account Age (Days)", direction: "desc" }],
        tenantId: TENANT_ID,
        userId: USER_ID
      })
    ])
    
    console.log(`   ✅ Created ${specializedViews.length} specialized views\n`)
    
    // 3. Publish views with appropriate permissions
    console.log("3️⃣ Publishing views...")
    
    const allViews = [...coreViews, ...specializedViews]
    
    // Publish each view with role-based access
    await Promise.all([
      // All users - default view for everyone
      viewsAPI.publish(PANEL_ID, coreViews[0].id, {
        publishedTitle: "All Users",
        permissions: ["read"],
        userGroups: ["viewers", "managers", "admins"],
        isDefault: true
      }, TENANT_ID, USER_ID),
      
      // Active users - for managers and up
      viewsAPI.publish(PANEL_ID, coreViews[1].id, {
        publishedTitle: "Active Users",
        permissions: ["read"],
        userGroups: ["managers", "admins"]
      }, TENANT_ID, USER_ID),
      
      // Top performers - managers only
      viewsAPI.publish(PANEL_ID, specializedViews[0].id, {
        publishedTitle: "Top Performers",
        permissions: ["read"],
        userGroups: ["managers", "admins"]
      }, TENANT_ID, USER_ID),
      
      // Action required - admins with edit permissions
      viewsAPI.publish(PANEL_ID, specializedViews[1].id, {
        publishedTitle: "Action Required",
        permissions: ["read", "edit"],
        userGroups: ["admins"]
      }, TENANT_ID, USER_ID)
    ])
    
    console.log("   ✅ All views published with permissions\n")
    
    // 4. Verify final view set
    console.log("4️⃣ Verifying final view set...")
    const publishedViews = await viewsAPI.list(PANEL_ID, TENANT_ID, USER_ID)
    
    console.log(`📊 Panel now has ${publishedViews.length} views:`)
    publishedViews.forEach((view, i) => {
      const defaultBadge = view.isDefault ? " (DEFAULT)" : ""
      console.log(`   📋 ${view.title}${defaultBadge}`)
      console.log(`      ${view.description}`)
    })
    
    console.log("\n🎉 View creation completed!")
    console.log("   Your panel is now ready for users!")
    
  } catch (error) {
    console.error("💥 View creation failed:", error.message)
    throw error
  }
}

// Run the complete workflow
createCompleteViewSet()
  .then(() => {
    console.log("\n🎯 Panel setup completed! Your users can now access structured data views.")
  })
  .catch(error => {
    console.error("\n💥 Setup failed:", error.message)
  })
```

## View Configuration Reference

### Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | Status = "active" |
| `notEquals` | Not equal | Status ≠ "inactive" |
| `contains` | Text contains | Name contains "john" |
| `startsWith` | Text starts with | Email starts with "admin" |
| `endsWith` | Text ends with | Email ends with ".com" |
| `greaterThan` | Number/date greater | Score > 75 |
| `lessThan` | Number/date less | Age < 30 |
| `greaterThanOrEqual` | Number/date >= | Score >= 50 |
| `lessThanOrEqual` | Number/date <= | Age <= 365 |
| `between` | Range | Score between 50-100 |
| `in` | In list | Status in ["active", "pending"] |
| `notIn` | Not in list | Status not in ["suspended"] |

### Sorting Options

```typescript
interface SortingCriteria {
  columnTitle: string         // Column to sort by
  direction: 'asc' | 'desc'   // Sort direction
  customOrder?: string[]      // Custom ordering for select fields
  nullsFirst?: boolean        // Where to put null values
}
```

### Permission Levels

| Permission | Description | User Can |
|------------|-------------|----------|
| `read` | View only | See data, filter, sort |
| `edit` | Modify data | Update column values |
| `create` | Add records | Create new rows |
| `delete` | Remove records | Delete rows |
| `manage` | Full control | Edit view settings |

## Troubleshooting

### Common Issues

**View Not Showing Data:**
```typescript
// Check if filters are too restrictive
const view = await viewsAPI.get(panelId, viewId, tenantId, userId)
console.log("Filters:", view.filters)

// Verify column visibility settings
console.log("Visible columns:", Object.entries(view.columnVisibility)
  .filter(([col, visible]) => visible)
  .map(([col]) => col))
```

**Sorting Not Working:**
```typescript
// Verify column titles in sorting match actual column titles
const columns = await panelsAPI.columns.list(panelId, tenantId, userId)
const columnTitles = columns.map(col => col.title)
console.log("Available columns:", columnTitles)

// Check if sorted columns are visible
view.sorting.forEach(sort => {
  const isVisible = view.columnVisibility[sort.columnTitle]
  console.log(`${sort.columnTitle}: ${isVisible ? "Visible" : "Hidden"}`)
})
```

**Permission Errors:**
```typescript
// Verify user groups and permissions
console.log("User groups:", userGroups)
console.log("View permissions:", view.permissions)
console.log("Published for:", view.userGroups)
```

## Next Steps

Congratulations! You've built a complete panel with data sources, columns, and views. Here's what you can do next:

🎯 **Immediate Next Steps:**
- [Next Steps →](./next-steps.md) - Complete your learning journey

🔗 **Related Guides:**
- [View Permissions](/guides/views/permissions.md) - Advanced access control
- [Complex Filtering](/guides/views/advanced-filtering.md) - Multi-criteria filters
- [View Templates](/guides/views/templates.md) - Reusable view configurations

🛠️ **Advanced Topics:**
- [Multi-tenant Views](/guides/views/multi-tenant.md) - Tenant-specific views
- [Performance Optimization](/guides/views/performance.md) - Large dataset handling
- [Custom Widgets](/guides/views/widgets.md) - Enhanced view components

## Summary

In this tutorial, you learned how to:

✅ **Create Custom Views** - Filtered subsets of your panel data  
✅ **Configure Sorting** - Multiple criteria and custom ordering  
✅ **Control Column Visibility** - Show relevant data per view  
✅ **Publish Views** - Make views available to specific user groups  
✅ **Set Permissions** - Control who can view and edit data  
✅ **Organize Access** - Role-based view distribution

Your panel is now a fully functional data management system that serves different user needs with tailored views! 