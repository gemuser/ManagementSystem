# Fibernet Pages

This folder contains the frontend pages for managing the dishhome and fibernet services.

## Structure

```
fibernetPages/
├── index.js              # Export file for all components
├── DishhomePage.jsx       # Manage dishhome TV service customers
├── FibernetPage.jsx       # Manage fibernet internet service customers
├── ComboPage.jsx          # Manage combo packages (dishhome + fibernet)
└── FibernetDashboard.jsx  # Dashboard overview for all services
```

## Pages Description

### 1. FibernetDashboard
- **Route**: `/fibernet-dashboard`
- **Purpose**: Overview dashboard showing statistics for all services
- **Features**:
  - Total customers across all services
  - Revenue breakdown
  - Service distribution charts
  - Recent customer activity

### 2. DishhomePage
- **Route**: `/dishhome`
- **Purpose**: Manage dishhome TV service customers
- **Features**:
  - View all dishhome customers
  - Add new customers
  - Edit existing customers
  - Delete customers
  - Search and filter functionality

### 3. FibernetPage
- **Route**: `/fibernet`
- **Purpose**: Manage fibernet internet service customers
- **Features**:
  - View all fibernet customers
  - Add new customers
  - Edit existing customers
  - Delete customers
  - Search and filter functionality

### 4. ComboPage
- **Route**: `/combo`
- **Purpose**: Manage combo packages combining dishhome and fibernet services
- **Features**:
  - View all combo packages
  - Create new combo packages
  - Edit existing combos
  - Delete combos
  - Shows cost savings compared to individual services

## Backend Integration

These pages integrate with the following backend endpoints:

### Dishhome Service
- `GET /api/dishhome/list` - Get all dishhome customers
- `POST /api/dishhome/create` - Create new customer
- `PUT /api/dishhome/update/:id` - Update customer
- `DELETE /api/dishhome/delete/:id` - Delete customer

### Fibernet Service
- `GET /api/fibernet/list` - Get all fibernet customers
- `POST /api/fibernet/create` - Create new customer
- `PUT /api/fibernet/update/:id` - Update customer
- `DELETE /api/fibernet/delete/:id` - Delete customer

### Combo Service
- `GET /api/Dhfibernet/list` - Get all combo packages
- `POST /api/Dhfibernet/create` - Create new combo
- `PUT /api/Dhfibernet/update/:id` - Update combo
- `DELETE /api/Dhfibernet/delete/:id` - Delete combo

## Data Structure

### Customer Fields (Dishhome & Fibernet)
- `customerId` - Auto-generated ID
- `name` - Customer name
- `phoneNumber` - Contact number
- `status` - 1 (Active) or 0 (Inactive)
- `package` - Service package name
- `address` - Customer address
- `price` - Monthly price
- `month` - Billing month

### Combo Fields
- `comboId` - Auto-generated ID
- `dishhomeId` - Reference to dishhome customer
- `fibernetId` - Reference to fibernet customer
- `totalPrice` - Combined package price
- `status` - 1 (Active) or 0 (Inactive)

## UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Search & Filter**: Real-time search across all customer data
- **Form Validation**: Client-side validation for all forms
- **Status Management**: Visual status indicators (Active/Inactive)
- **Sweet Alert**: User-friendly notifications and confirmations
- **Clean UI**: Modern design with Tailwind CSS and Lucide icons

## Navigation

The pages are accessible through the sidebar navigation under the "Fibernet Services" section:
- Fibernet Dashboard
- Dishhome
- Fibernet
- Combo Packages
