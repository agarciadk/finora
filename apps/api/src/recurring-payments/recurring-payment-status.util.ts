// A recurring payment has "ended" once its currently pending occurrence
// (`nextPaymentDate`) falls strictly after its optional `endDate`. `endDate`
// itself is an inclusive boundary: the occurrence due exactly on `endDate`
// is still valid.
export function hasRecurringPaymentEnded(recurringPayment: {
  nextPaymentDate: Date;
  endDate: Date | null;
}): boolean {
  return (
    recurringPayment.endDate !== null &&
    recurringPayment.nextPaymentDate > recurringPayment.endDate
  );
}
