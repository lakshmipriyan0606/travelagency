export const validateUploadFile = (file) => {
  if (!file || !file.buffer) {
    const error = new Error("No image provided");
    error.statusCode = 400;
    return { isValid: false, error };
  }
  return { isValid: true };
};
