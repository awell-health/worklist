# Your First Panel

In this tutorial, you'll create your first panel from scratch. We'll build a simple **Team Directory Panel** that demonstrates the core concepts of the Panels system.

## What You'll Build

By the end of this section, you'll have:
- ✅ A configured panel with proper metadata
- ✅ Understanding of panel structure and purpose
- ✅ Foundation for adding data sources and columns

## Understanding Panels

A **Panel** is the foundation of the Panels system. Think of it as:
- 🗂️ **Data Container**: Organizes related information
- 🔧 **Configuration Hub**: Defines how data is structured and accessed
- 👥 **Multi-tenant Resource**: Isolated by tenant and owned by users
- 📊 **View Foundation**: The base for creating multiple user views

## Step 1: Import the API Client

First, let's set up our imports and basic configuration:

\`\`\`typescript
// panel-demo.ts
import { panelsAPI } from '@panels/app/api'

// Configuration for our demo
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

console.log("Starting panel creation demo...")
\`\`\`

## Step 2: Create Your First Panel

\`\`\`typescript
async function createTeamDirectoryPanel() {
  try {
    // Create the panel with descriptive metadata
    const panel = await panelsAPI.create({
      name: "Team Directory",
      description: "A comprehensive directory of team members with contact information and roles",
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Panel created successfully!")
    console.log(`   Panel ID: ${panel.id}`)
    console.log(`   Name: ${panel.name}`)
    console.log(`   Description: ${panel.description}`)
    console.log(`   Created: ${panel.createdAt}`)
    
    return panel
  } catch (error) {
    console.error("❌ Failed to create panel:", error)
    throw error
  }
}

// Run the function
const myPanel = await createTeamDirectoryPanel()
\`\`\`

## Step 3: Verify Panel Creation

Let's verify the panel was created and explore its properties:

\`\`\`typescript
async function verifyPanel(panelId: number) {
  try {
    // Retrieve the panel by ID
    const panel = await panelsAPI.get({ id: panelId })
    
    console.log("📋 Panel Details:")
    console.log(`   ID: ${panel.id}`)
    console.log(`   Name: ${panel.name}`)
    console.log(`   Description: ${panel.description}`)
    console.log(`   Tenant: ${panel.tenantId}`)
    console.log(`   Owner: ${panel.userId}`)
    console.log(`   Created: ${panel.createdAt}`)
    console.log(`   Updated: ${panel.updatedAt}`)
    
    // Check cohort rule (default configuration)
    console.log("🎯 Cohort Rule:")
    console.log(`   Conditions: ${panel.cohortRule.conditions.length}`)
    console.log(`   Logic: ${panel.cohortRule.logic}`)
    
    return panel
  } catch (error) {
    console.error("❌ Failed to retrieve panel:", error)
    throw error
  }
}

// Verify our panel
await verifyPanel(myPanel.id)
\`\`\`

## Step 4: List User Panels

Let's see all panels for our user:

\`\`\`typescript
async function listUserPanels() {
  try {
    const panels = await panelsAPI.all(TENANT_ID, USER_ID)
    
    console.log(`📁 Found ${panels.length} panels for user:`)
    panels.forEach((panel, index) => {
      console.log(`   ${index + 1}. ${panel.name} (ID: ${panel.id})`)
      console.log(`      Created: ${panel.createdAt.toLocaleDateString()}`)
      console.log(`      Description: ${panel.description || 'No description'}`)
    })
    
    return panels
  } catch (error) {
    console.error("❌ Failed to list panels:", error)
    throw error
  }
}

// List all panels
const allPanels = await listUserPanels()
\`\`\`

## Step 5: Update Panel Metadata

You can update panel information after creation:

\`\`\`typescript
async function updatePanelInfo(panelId: number) {
  try {
    const updatedPanel = await panelsAPI.update({
      id: panelId,
      name: "Team Directory - Updated",
      description: "A comprehensive directory of team members with contact information, roles, and status tracking",
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    
    console.log("✅ Panel updated successfully!")
    console.log(`   New name: ${updatedPanel.name}`)
    console.log(`   New description: ${updatedPanel.description}`)
    console.log(`   Updated at: ${updatedPanel.updatedAt}`)
    
    return updatedPanel
  } catch (error) {
    console.error("❌ Failed to update panel:", error)
    throw error
  }
}

// Update our panel
const updatedPanel = await updatePanelInfo(myPanel.id)
\`\`\`

## Complete Example

Here's the complete code for creating and managing your first panel:

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'

const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

async function firstPanelDemo() {
  console.log("🚀 Starting Team Directory Panel Demo\n")
  
  try {
    // 1. Create the panel
    console.log("1️⃣ Creating panel...")
    const panel = await panelsAPI.create({
      name: "Team Directory",
      description: "A comprehensive directory of team members",
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    console.log(`   ✅ Panel created: ${panel.name} (ID: ${panel.id})\n`)
    
    // 2. Verify creation
    console.log("2️⃣ Verifying panel...")
    const retrievedPanel = await panelsAPI.get({ id: panel.id })
    console.log(`   ✅ Panel verified: ${retrievedPanel.name}\n`)
    
    // 3. List all panels
    console.log("3️⃣ Listing user panels...")
    const allPanels = await panelsAPI.all(TENANT_ID, USER_ID)
    console.log(`   ✅ Found ${allPanels.length} panels\n`)
    
    // 4. Update panel
    console.log("4️⃣ Updating panel description...")
    const updatedPanel = await panelsAPI.update({
      id: panel.id,
      name: "Team Directory - Enhanced",
      description: "Enhanced team directory with comprehensive member information",
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    console.log(`   ✅ Panel updated: ${updatedPanel.name}\n`)
    
    console.log("🎉 Demo completed successfully!")
    console.log(`   Your panel ID: ${panel.id}`)
    console.log("   Next: Add data sources to populate your panel with data")
    
    return panel
    
  } catch (error) {
    console.error("❌ Demo failed:", error)
    throw error
  }
}

// Run the demo
firstPanelDemo()
  .then(panel => {
    console.log(`\n🎯 Panel ready for data sources: ${panel.id}`)
  })
  .catch(error => {
    console.error("\n💥 Demo failed:", error.message)
  })
\`\`\`

## Understanding the Response

When you create a panel, you get back a `CreatePanelResponse` object with:

\`\`\`typescript
{
  id: number              // Unique panel identifier
  name: string           // Panel display name
  description: string    // Panel description (nullable)
  tenantId: string      // Tenant isolation
  userId: string        // Panel owner
  cohortRule: {         // Population definition (default empty)
    conditions: [],
    logic: "AND"
  },
  createdAt: Date       // Creation timestamp
  updatedAt: Date       // Last modification timestamp
}
\`\`\`

## Panel Naming Best Practices

Choose meaningful panel names that describe their purpose:

✅ **Good Examples:**
- "User Management Panel"
- "Sales Pipeline Dashboard"
- "Customer Support Tickets"
- "Product Inventory Tracker"

❌ **Avoid:**
- "Panel 1"
- "Test"
- "My Panel"
- "Data"

## Next Steps

Now that you have a panel, you're ready to add data sources!

**What you've learned:**
- ✅ How to create panels with the API client
- ✅ Panel structure and metadata
- ✅ CRUD operations for panels
- ✅ Error handling patterns

**Coming next:**
- 🔌 **Adding data sources** to connect your panel to real data
- 📊 **Creating columns** to structure your data
- 👀 **Building views** for different perspectives

[Next: Adding Data Sources →](./adding-data-sources)

## Troubleshooting

**Panel creation fails:**
\`\`\`typescript
// Check your tenant and user IDs
console.log("Tenant ID:", TENANT_ID)
console.log("User ID:", USER_ID)

// Verify API connectivity
try {
  const panels = await panelsAPI.all(TENANT_ID, USER_ID)
  console.log("API connectivity: OK")
} catch (error) {
  console.error("API connectivity: FAILED", error)
}
\`\`\`

**Common Issues:**
- Invalid tenant/user IDs
- Network connectivity problems
- Missing environment variables
- Database connection issues

If you encounter problems, check the [troubleshooting guide](/guides/api-client/handling-errors).
