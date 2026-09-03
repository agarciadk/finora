-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "iban" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isTransfer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mainIncomeSource" TEXT,
ADD COLUMN     "payday" INTEGER;
