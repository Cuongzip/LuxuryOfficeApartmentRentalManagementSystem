const formatAccountResponse = (account) => ({
  id: account.id,
  email: account.email,
  role: account.role,
  status: account.status,
  fullName: account.employee?.fullName || account.customer?.fullName || null,
  customer: account.customer
    ? {
        id: account.customer.id,
        fullName: account.customer.fullName,
        phoneNumber: account.customer.phoneNumber,
        nationalId: account.customer.nationalId,
      }
    : null,
  employee: account.employee
    ? {
        id: account.employee.id,
        fullName: account.employee.fullName,
        phoneNumber: account.employee.phoneNumber,
      }
    : null,
});

export default formatAccountResponse;
