const formatAccountResponse = (account) => ({
  id: account.id,
  email: account.email,
  role: account.role,
  status: account.status,
  customer: account.customer
    ? {
        id: account.customer.id,
        fullName: account.customer.fullName,
        phoneNumber: account.customer.phoneNumber,
      }
    : null,
});

export default formatAccountResponse;
