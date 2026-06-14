export const validateForm = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0];
    if (!fieldName) return;
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  });

  return { success: false, errors };
};
