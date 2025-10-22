"use client";
import { Alert, Box, Snackbar, SnackbarOrigin } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import Slide, { SlideProps } from "@mui/material/Slide";

interface AlertProviderProps {
  children: React.ReactNode;
}

interface State extends SnackbarOrigin {
  open: boolean;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

export interface AlertContext {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export const AlertContext = createContext<AlertContext>({
  error: "",
  setError: () => {},
});

export const AlertProvider = (props: AlertProviderProps) => {
  const [error, setError] = useState("");
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = state;

  useEffect(() => {
    if (error) {
      setState({ ...state, open: true });
    }
  }, [error]);

  const handleClose = () => {
    setState({ ...state, open: false });
    setError("");
  };
  return (
    <AlertContext.Provider value={{ error, setError }}>
      {error && (
        <Box sx={{ width: 500 }}>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            message={error}
            autoHideDuration={5000}
            TransitionComponent={SlideTransition}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
              variant="filled"
            >
              {error}
            </Alert>
          </Snackbar>
        </Box>
      )}

      {props.children}
    </AlertContext.Provider>
  );
};
