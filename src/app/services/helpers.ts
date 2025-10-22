type ErrorType = {
  error: string;
  error_description?: string;
  error_uri?: string;
  state?: string;
};

export const handleError = (error: ErrorType, defaultText?: string) => {
  let errorText = defaultText || "Unknown error";
  try {
    console.error(JSON.stringify(error));
    errorText = error?.error || JSON.stringify(error);
    if (error?.error_description)
      errorText = errorText + ": " + error?.error_description;
  } catch (err) {
    console.error(err);
  }

  localStorage.setItem("authError", errorText);
  window.dispatchEvent(new Event("authError"));
};
