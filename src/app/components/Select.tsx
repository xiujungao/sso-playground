"use client";
import { Select as MuiSelect, SelectProps } from "@mui/material";

export const Select = (props: SelectProps) => {
  return <MuiSelect variant="filled" {...props} />;
};
