# 📋 Invoice Generation Tutorial
## Complete Guide to Generate Professional Invoices in DishHome & Fibernet System

### 🚀 **SETUP INSTRUCTIONS**

#### Step 1: Database Setup
1. Open your MySQL client (phpMyAdmin, MySQL Workbench, or command line)
2. Connect to your `inventory_system` database
3. Execute the SQL from: `.\backend\database\invoice_tables.sql`
   - This creates invoice tables for DishHome, Fibernet, and combo services
   - Tables include payment tracking, discount handling, and audit fields

#### Step 2: Start Servers
1. **Backend Server:**
   ```bash
   cd D:\ManagementSystem\backend
   node index.js
   ```
   ✅ Backend running at: http://localhost:8000

2. **Frontend Server:**
   ```bash
   cd D:\ManagementSystem\frontend
   npm run dev
   ```
   ✅ Frontend running at: http://localhost:5174

---

### 📄 **HOW TO GENERATE INVOICES**

#### For DishHome Customers:

1. **Navigate to DishHome Page:**
   - Open browser: `http://localhost:5174`
   - Click on "DishHome Services" from main menu
   - You'll see the DishHome customer management page

2. **Generate Invoice:**
   - Find the customer you want to invoice
   - Click the blue 📄 **FileText icon** next to their name
   - This opens the invoice generation dialog

3. **Fill Invoice Details:**
   ```
   🔹 Billing Months: Choose 1-12 months
   🔹 Discount Type: 
      - No Discount
      - Percentage Discount (0-100%)
      - Fixed Amount Discount (in Rs.)
   🔹 Due Date: Set payment deadline (default: 30 days)
   🔹 Notes: Add any special instructions
   ```

4. **Generate & Download:**
   - Click "Generate Invoice" button
   - PDF automatically downloads to your computer
   - Invoice is saved to database for record keeping

#### For Fibernet Customers:

1. **Navigate to Fibernet Page:**
   - Click on "Fibernet Services" from main menu
   - Same process as DishHome but with blue Fibernet branding

2. **Same Invoice Process:**
   - Click 📄 **FileText icon** next to customer
   - Fill in billing details
   - Generate and download PDF

---

### 💼 **INVOICE FEATURES**

#### Professional PDF Invoice Includes:
- **Company Branding** (DishHome/Fibernet logos)
- **Customer Information** (Name, Phone, Address, CAS ID)
- **Service Details** (Package, Billing Period, Rates)
- **Billing Breakdown** (Subtotal, Discounts, Total)
- **Payment Information** (Due Date, Invoice Number)
- **Professional Layout** with clean typography

#### Database Storage:
- All invoices stored in `dishhome_invoices` and `fibernet_invoices` tables
- Payment status tracking (Pending, Paid, Overdue, Cancelled)
- Revenue analytics and reporting capabilities
- Audit trails with timestamps

---

### 🔧 **API ENDPOINTS (For Advanced Users)**

```javascript
// Generate DishHome Invoice
POST /api/invoices/dishhome/generate
{
  "customerId": 123,
  "monthsBilled": 3,
  "discountPercentage": 10,
  "dueDate": "2025-09-12",
  "notes": "Early payment discount"
}

// Generate Fibernet Invoice
POST /api/invoices/fibernet/generate
{
  "customerId": 456,
  "monthsBilled": 1,
  "discountAmount": 500,
  "dueDate": "2025-09-12",
  "notes": "Loyalty customer discount"
}

// Get Invoice List
GET /api/invoices/dishhome?customerId=123&paymentStatus=pending

// Update Payment Status
PATCH /api/invoices/dishhome/789/payment
{
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "paymentDate": "2025-08-12"
}
```

---

### 💡 **BUSINESS USE CASES**

#### Monthly Billing:
1. Set monthsBilled = 1 for regular monthly charges
2. Use percentage discounts for loyal customers
3. Set appropriate due dates (usually 15-30 days)

#### Bulk Billing:
1. Set monthsBilled = 3, 6, or 12 for quarterly/yearly billing
2. Apply discounts for advance payments
3. Generate invoices for multiple customers efficiently

#### Payment Tracking:
1. Mark invoices as "paid" when payments received
2. Track "overdue" invoices for follow-up
3. Generate reports for revenue analysis

---

### 📊 **EXAMPLE WORKFLOW**

#### Scenario: Monthly DishHome Billing
1. Customer: John Doe (Gold Plan - Rs. 1500/month)
2. Generate 3-month invoice with 5% advance payment discount
3. Invoice Details:
   ```
   Package: Gold Plan
   Months: 3
   Rate: Rs. 1500/month
   Subtotal: Rs. 4500
   Discount (5%): Rs. 225
   Total: Rs. 4275
   Due Date: 30 days from invoice date
   ```
4. PDF downloads automatically
5. Invoice stored in database for tracking

---

### 🚨 **TROUBLESHOOTING**

#### Common Issues:
1. **Server Not Starting:** Check if ports 8000 and 5174 are available
2. **Database Errors:** Ensure MySQL is running and invoice tables are created
3. **PDF Not Downloading:** Check browser pop-up blocker settings
4. **Invoice Button Missing:** Ensure you've added the updated code to both DishHome and Fibernet pages

#### Quick Fixes:
```bash
# Restart Backend
cd D:\ManagementSystem\backend
node index.js

# Restart Frontend
cd D:\ManagementSystem\frontend
npm run dev

# Check Database Connection
# Visit: http://localhost:8000/api/health
```

---

### 🎯 **SUCCESS METRICS**

After setup, you can:
- ✅ Generate professional PDF invoices in seconds
- ✅ Track payment status and revenue
- ✅ Apply flexible discounts and billing periods
- ✅ Maintain complete audit trails
- ✅ Scale to handle hundreds of customers
- ✅ Integrate with existing customer management

---

### 📞 **NEXT STEPS**

1. **Test the System:** Generate a few test invoices
2. **Customize Branding:** Update PDF templates with your logo/colors
3. **Set Up Payment Integration:** Connect with payment gateways
4. **Create Reports:** Build dashboards for revenue tracking
5. **Automate Billing:** Schedule monthly invoice generation

---

**🎉 Congratulations! Your invoice system is now fully operational!**

For questions or customizations, check the code in:
- Backend: `D:\ManagementSystem\backend\dishomeFibernet\controllers\invoiceControllers.js`
- Frontend: `D:\ManagementSystem\frontend\src\fibernetPages\DishhomePage.jsx`
- Routes: `D:\ManagementSystem\backend\dishomeFibernet\routes\invoiceRoutes.js`
