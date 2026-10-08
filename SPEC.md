## Database Schema

### Users
- id
- email
- passwordHash
- fullName
- role
  - ADMIN
  - INVENTORY_MANAGER
  - CASHIER
- isActive

### Categories
- id
- name
  - Fragile
  - Cold
  - Tech
  - Cleaning
  - General

### Products
- id
- sku
- name
- categoryId
- price
- quantityInStock
- reorderThreshold
- description
- imageUrl

### Product Details
- id
- productId
- expiryDate
- storageTemp
- warrantyPeriod
- serialNumber
- isFragile
- isHazardous
- handlingNote
- safetyNote

Only use the product detail fields that apply to the selected category.
Keep the other fields empty.

### Transactions
- id
- cashierId
- subtotal
- tax
- total
- createdAt

### Transaction Items
- id
- transactionId
- productId
- quantity
- unitPrice

Store the unitPrice at the time of sale.

---

## User Roles

### Admin
- Full system access
- Manage users
- Assign user roles
- Manage products
- Manage categories
- View all sales
- View reports and analytics
- Manage system settings

### Inventory Manager
- Add products
- Edit products
- Deactivate products
- Restock products
- Assign product categories
- Set reorder thresholds
- View low stock products
- View sales history
- Cannot manage users

### Cashier
- Use the POS
- Search products
- Scan products
- Create bills
- Complete sales
- Generate receipts
- View own transactions
- Cannot edit products
- Cannot edit prices
- Cannot edit categories
- Cannot view other cashiers' sales

---

## Access Control

- User must be logged in
- User must have a valid JWT
- Backend must check the user's role
- Users can only access actions allowed for their role
- Role restrictions must be enforced by backend middleware

 ## Tax Rate Flat tax rate: 5% applied to subtotal on every transaction. total = subtotal + (subtotal * 0.05)