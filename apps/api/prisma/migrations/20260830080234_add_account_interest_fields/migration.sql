-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "interestPaymentDay" INTEGER,
ADD COLUMN     "interestRate" DECIMAL(5,2),
ADD COLUMN     "taxRate" DECIMAL(5,2);
