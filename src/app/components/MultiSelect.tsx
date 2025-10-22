"use client";
import { Autocomplete, Chip } from "@mui/material";
import { TextField } from "./TextField";
import { useState } from "react";

interface MultiSelectProps {
  onChange: (values: string[]) => void;
  label: string;
  defaultValue?: string[];
  fixedOptions?: string[];
}

export const MultiSelect = (props: MultiSelectProps) => {
  const { onChange, label, defaultValue = [], fixedOptions = [] } = props;
  return (
    <Autocomplete
      multiple
      options={[]}
      defaultValue={defaultValue}
      freeSolo
      onChange={(_, newValue) => {
        onChange(newValue as string[]);
      }}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
            key={option}
            disabled={fixedOptions.includes(option)}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};
