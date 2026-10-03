# AI Customer Churn Prediction & Customer Segmentation System

## Architecture
- **Frontend**: Next.js, React, Tailwind CSS, TypeScript
- **Backend API**: Next.js API Routes, Prisma ORM
- **Database**: MySQL (`customer_churn_db`)
- **ML Service**: Python FastAPI, scikit-learn

## Database Setup (Phase 2)
1. **Create the Database** (in your MySQL CLI or Workbench):
   ```sql
   CREATE DATABASE customer_churn_db;
   ```
2. **Configure Environment Variables**:
   Open `frontend/.env` and update the `DATABASE_URL` with your actual MySQL username and password:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/customer_churn_db"
   ```
3. **Run Prisma Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Excel Import & Data Quality (Phase 3)
The system supports bulk importing customer data from `.xlsx` and `.xls` files.

### Supported Columns
- `customer_id` (Required, Unique)
- `age` (Numeric, > 0)
- `gender`
- `tenure` (Numeric, >= 0)
- `contract_type` (Required)
- `monthly_charges` (Numeric, >= 0)
- `total_charges`
- `payment_method`
- `internet_service`
- `number_of_services`
- `complaints`
- `customer_support_calls`
- `usage_frequency`
- `late_payments`
- `churn` (Required, Yes/No or True/False)

### Import Process
1. Upload an Excel file at `/data-import`.
2. The file is analyzed in-memory (File Validation, Column Normalization, Row Validation).
3. Missing values and invalid rows are flagged.
4. Duplicates within the file are flagged.
5. Review the preview and click "Import Valid Data".
6. The system connects to MySQL, ignores existing duplicates, and inserts new valid rows via a Prisma transaction.
7. An `ImportHistory` record is saved.

### Data Quality
Visit `/data-quality` to see a dashboard summarizing dataset completeness, missing values, and churn distribution directly from the database.
