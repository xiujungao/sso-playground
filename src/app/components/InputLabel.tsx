"use client";
import {
  InputLabel as MuiInputLabel,
  InputLabelProps,
  styled,
} from "@mui/material";

const StyledInputLabel = styled(MuiInputLabel)<InputLabelProps>(() => ({
  padding: 5,
  width: "100%",
}));

export const InputLabel = (props: InputLabelProps) => {
  return <StyledInputLabel variant="filled" {...props} />;
};
