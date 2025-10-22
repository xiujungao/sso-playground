import {
  Paper,
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { TextField } from "./TextField";

interface TableDataProps {
  token: string;
}

const TableData = (props: TableDataProps) => {
  const { token } = props;
  const decodedToken = (token: string) => {
    if (!token) return;
    try {
      return jwtDecode(token);
    } catch (err) {
      return JSON.parse(token);
    }
  };

  const unixTimestampToDate = (timestamp: number) => {
    return new Date(timestamp * 1000);
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Claim</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(decodedToken(JSON.stringify(token)) || {}).map(
          ([key, val]: any) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>
                {["exp", "iat", "auth_time"].includes(key) ? (
                  <Tooltip title={String(unixTimestampToDate(val))}>
                    {val}
                  </Tooltip>
                ) : (
                  JSON.stringify(val)
                )}
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};

interface TokenDataProps {
  tokens: any;
}

export default function TokenData(props: TokenDataProps) {
  const { tokens } = props;
  const [tabIndex, setTabIndex] = useState(0);
  const [token, setToken] = useState<string>("");
  const decodedToken = (token: string) => {
    if (!token) return;
    return jwtDecode(token);
  };
  return (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <Box sx={{ padding: 1 }}>
        <Autocomplete
          disablePortal
          options={Object.keys(tokens).filter((key) => key.endsWith("token"))}
          renderInput={(params) => (
            <TextField {...params} label="Select Token..." />
          )}
          onChange={(e, newValue) => setToken(newValue as string)}
        />
        {token && (
          <>
            <Tabs
              value={tabIndex}
              onChange={(e, newValue) => setTabIndex(newValue)}
            >
              <Tab label={`Decoded`} />
              <Tab label="Raw" />
            </Tabs>
            {tabIndex === 0 ? (
              <TableData token={tokens[token]} />
            ) : (
              <Typography variant="body1" sx={{ wordWrap: "break-word" }}>
                {JSON.stringify(tokens[token])}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
