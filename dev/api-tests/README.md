# Panel API Bruno Test Collection

This Bruno collection provides comprehensive API testing for the Panel Management system (formerly Worklists).

## Setup

1. **Install Bruno**: Download from [https://usebruno.com/](https://usebruno.com/)

2. **Open Collection**: Open Bruno and import this folder as a collection

3. **Configure Environment**:
   - Select the "Local" environment
   - Update variables in `environments/Local.bru`:
     - `baseUrl`: Your API server URL (default: http://localhost:3000)
     - `tenantId`, `userId`: Valid tenant/user IDs for testing
     - `panelId`, `dataSourceId`, etc.: Update with actual IDs after creating resources

## Test Structure

### 📁 **Panel Management** (5 tests)

- List Panels
- Create Panel
- Get Panel
- Update Panel
- Delete Panel (add manually)

### 📁 **DataSources** (3 tests)

- List DataSources
- Create DataSource
- Sync DataSource

### 📁 **Columns** (3 tests)

- List Columns
- Create Base Column
- Create Calculated Column

### 📁 **Views** (3 tests)

- List Views
- Create View
- Publish View

### 📁 **View Configuration** (2 tests)

- Update View Sorts
- Update View Filters

### 📁 **Change Tracking** (3 tests)

- List Panel Changes
- List View Notifications
- Mark Notifications Read

## Running Tests

### Sequential Execution

1. Start with **Panel Management** → Create Panel
2. Use returned `panelId` to update environment variables
3. Run **DataSources** → Create DataSource
4. Use returned `dataSourceId` for column creation
5. Continue through folders in order

### Individual Testing

- Each test can run independently
- Update environment variables with valid IDs
- Tests include validation for response structure and status codes

## Key Features Tested

✅ **CRUD Operations** - Create, Read, Update, Delete for all entities  
✅ **Dynamic Columns** - Base columns from data sources + calculated columns  
✅ **View Management** - Personal and tenant-wide published views  
✅ **Configuration** - Sorting and filtering for views  
✅ **Change Tracking** - Panel changes and user notifications  
✅ **Tenant Isolation** - All requests include tenant/user context  
✅ **Error Handling** - Tests validate expected response codes

## Test Data Examples

The collection includes realistic test data:

- **Panels**: User management panels with cohort rules
- **DataSources**: Database, API, and file source types
- **Columns**: Email validation, calculated full names, etc.
- **Views**: Filtered views with sorting and layout options
- **Filters**: Complex filter combinations with logical operators

## Environment Variables

```
baseUrl: http://localhost:8087
tenantId: tenant-123
userId: user-456
panelId: 1            # Update after creating panel
dataSourceId: 1       # Update after creating datasource
columnId: 1           # Update after creating column
viewId: 1             # Update after creating view
notificationId: 1     # Update after creating notification
```

## Notes

- Tests assume your API server is running on `localhost:8087`
- Update environment variables with actual IDs from your test data
- Some tests depend on previous tests (e.g., column creation needs a dataSourceId)
- All endpoints include tenant isolation and user access control validation
