"use client";
import {
  TextField as MuiTextField,
  TextFieldProps,
  styled,
} from "@mui/material";

const StyledTextField = styled(MuiTextField)<TextFieldProps>(() => ({
  padding: 5,
  width: "100%",
}));

export const TextField = (props: TextFieldProps) => {
  return <StyledTextField variant="filled" {...props} />;
};
