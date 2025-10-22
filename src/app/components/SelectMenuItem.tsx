"use client";
import {
  MenuItem as MuiSelectMenuItem,
  MenuItemProps,
  styled,
} from "@mui/material";

export const SelectMenuItem = (props: MenuItemProps) => {
  return <MuiSelectMenuItem {...props} />;
};
