"use client";
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { MultiSelect } from "./components/MultiSelect";
import { TextField } from "./components/TextField";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import AuthService from "./services/authorization";
import TokenData from "./components/TokenData";
import { AlertContext } from "./components/AlertProvider";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { env } from "next-runtime-env";

interface Tokens {
  access_token: string;
  id_token: string;
  refresh_token: string;
}

interface FormValues {
  clientId: { value: string; error: boolean; errorMessage: string };
  clientSecret: { value: string; error: boolean; errorMessage: string };
  discoveryUrl: {
    value: string;
    error: boolean;
    errorMessage: string;
  };
  authorizationUrl: {
    value: string;
    error: boolean;
    errorMessage: string;
  };
  forwardQueryParams: { value: string; error: boolean; errorMessage: string };
  tokenUrl: { value: string; error: boolean; errorMessage: string };
  logoutUrl: { value: string; error: boolean; errorMessage: string };
  redirectUri: { value: string; error: boolean; errorMessage: string };
  scopes: { value: string[]; error: boolean; errorMessage: string };
  username: { value: string; error: boolean; errorMessage: string };
  password: { value: string; error: boolean; errorMessage: string };
  userinfoUrl: { value: string; error: boolean; errorMessage: string };
}

const getInitialFormValues = (redirectUri: string) => {
  return {
    clientId: {
      value: "",
      error: false,
      errorMessage: "Client ID is required",
    },
    clientSecret: {
      value: "",
      error: false,
      errorMessage: "Client secret is required",
    },
    discoveryUrl: {
      value: "",
      error: false,
      errorMessage: "",
    },
    authorizationUrl: {
      value: "",
      error: false,
      errorMessage: "Please enter a valid authorization URL",
    },
    forwardQueryParams: {
      value: "",
      error: false,
      errorMessage: "",
    },
    tokenUrl: {
      value: "",
      error: false,
      errorMessage: "Please enter a valid token URL",
    },
    logoutUrl: {
      value: "",
      error: false,
      errorMessage: "",
    },
    userinfoUrl: {
      value: "",
      error: false,
      errorMessage: "",
    },
    redirectUri: {
      value: redirectUri || "",
      error: false,
      errorMessage: "",
    },
    scopes: {
      value: ["openid"],
      error: false,
      errorMessage: "Please pass atleast one scope",
    },
    username: {
      value: "",
      error: false,
      errorMessage: "Username is required",
    },
    password: {
      value: "",
      error: false,
      errorMessage: "Password is required",
    },
  };
};

export default function Form() {
  const [flowType, setFlowType] = useState<string>("");
  const [formValues, setFormValues] = useState<FormValues>(
    getInitialFormValues(env("NEXT_PUBLIC_REDIRECT_URI") || "")
  );

  const [authenticated, setAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<Tokens>({
    access_token: "",
    id_token: "",
    refresh_token: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  const [validDiscoveryUrl, setValidDiscoveryUrl] = useState(false);
  let validatedFormFields = ["clientId"];

  if (flowType === "password") {
    validatedFormFields = ["clientId", "tokenUrl", "username", "password"];
  } else if (flowType === "service-account") {
    validatedFormFields = ["clientId", "tokenUrl", "clientSecret"];
  } else validatedFormFields = ["authorizationUrl", "clientId", "tokenUrl"];

  const { error, setError } = useContext<AlertContext>(AlertContext);
  const authService = useMemo(
    () =>
      new AuthService({
        authorizationEndpoint: formValues.authorizationUrl.value,
        tokenEndpoint: formValues.tokenUrl.value,
        logoutEndpoint: formValues.logoutUrl.value,
        clientId: formValues.clientId.value,
        clientSecret: formValues.clientSecret.value,
        redirectUri: formValues.redirectUri.value,
        scopes: formValues.scopes.value,
        username: formValues.username.value,
        password: formValues.password.value,
        forwardQueryParams: formValues.forwardQueryParams.value,
        userinfoEndpoint: formValues.userinfoUrl.value,
      }),
    [
      formValues.authorizationUrl.value,
      formValues.tokenUrl.value,
      formValues.logoutUrl.value,
      formValues.clientId.value,
      formValues.clientSecret.value,
      formValues.redirectUri.value,
      formValues.scopes.value,
      formValues.username.value,
      formValues.password.value,
      formValues.forwardQueryParams.value,
      formValues.userinfoUrl.value,
    ]
  );

  const handleFlowTypeChange = (e: any) => {
    setFlowType(e.target.value);
    window.localStorage.setItem("flowType", e.target.value);
  };

  const handleAuthCallback = useCallback(async () => {
    try {
      localStorage.removeItem("authError");
      await authService.handleCallback();
      setAuthenticated(authService.isAuthenticated());
      if (sessionStorage.getItem("tokens"))
        setTokens(JSON.parse(sessionStorage.getItem("tokens") || ""));
    } catch (err: any) {
      console.error(err);
    }
  }, [authService]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("formValues")) {
        setFormValues(
          JSON.parse(window.localStorage.getItem("formValues") || "")
        );
      }
      if (window.localStorage.getItem("flowType"))
        setFlowType(localStorage.getItem("flowType") || "");
      if (window.localStorage.getItem("authError"))
        setError(window.localStorage.getItem("authError") || "");
      window.addEventListener("tokens", (e: any) => {
        window.location.reload();
      });
      window.addEventListener("authError", (e: any) => {
        setError(window.localStorage.getItem("authError") || "");
        window.localStorage.removeItem("authError");
      });
    }
  }, []);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  useEffect(() => {
    populateUrls(formValues.discoveryUrl.value);
  }, [formValues.discoveryUrl.value]);

  const handleLogin = async () => {
    try {
      await authService.login(flowType);
    } catch (err: any) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    if (flowType === "authorization-code") {
      authService.logout();
    } else {
      sessionStorage.removeItem("tokens");
      window.location.reload();
    }
  };

  const setScopes = (scopes: string[]) => {
    setFormValues({
      ...formValues,
      scopes: {
        value: scopes,
        error: false,
        errorMessage: "",
      },
    });
  };

  const populateUrls = async (discoveryUrl: string) => {
    if (discoveryUrl) {
      try {
        const url = new URL(discoveryUrl);
        setFormValues({
          ...formValues,
          discoveryUrl: {
            value: discoveryUrl,
            error: false,
            errorMessage: "",
          },
        });
        const res = await fetch(discoveryUrl);
        if (res.status === 200) {
          setValidDiscoveryUrl(true);
          const data = await res.json();
          if (data.authorization_endpoint)
            setFormValues({
              ...formValues,
              authorizationUrl: {
                ...formValues["authorizationUrl"],
                value: data.authorization_endpoint || "",
                error: false,
              },
              tokenUrl: {
                ...formValues["tokenUrl"],
                value: data.token_endpoint || "",
                error: false,
              },
              logoutUrl: {
                ...formValues["logoutUrl"],
                value: data.end_session_endpoint || "",
                error: false,
              },
              userinfoUrl: {
                ...formValues["userinfoUrl"],
                value: data.userinfo_endpoint || "",
                error: false,
              },
            });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: {
        ...formValues[name as keyof FormValues],
        value,
        error: value.trim() === "" ? true : false,
      },
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let formErrors = false;
    const formFields = Object.keys(formValues);
    let newFormValues = { ...formValues };

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index];
      const currentValue = formValues[currentField as keyof FormValues].value;

      if (currentValue === "") {
        newFormValues = {
          ...newFormValues,
          [currentField]: {
            ...formValues[currentField as keyof FormValues],
            error: true,
          },
        };
        if (validatedFormFields.includes(currentField)) formErrors = true;
      }
    }

    setFormValues(newFormValues);
    localStorage.setItem("formValues", JSON.stringify(newFormValues));

    if (!formErrors) {
      handleLogin();
    }
  };

  return (
    <>
      <Grid container sx={{ padding: 0.5 }} spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ padding: 1, color: "black" }}>
            OpenID-Connect
          </Typography>
        </Grid>
        <Grid item xs={12} md={authenticated ? 6 : 12}>
          <Paper elevation={3}>
            <Box sx={{ padding: 1, height: "100%" }}>
              <form
                noValidate
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <FormControl sx={{ width: "100%", padding: 1 }}>
                  <FormLabel>Flow</FormLabel>
                  <RadioGroup
                    value={flowType}
                    onChange={(e) => handleFlowTypeChange(e)}
                    sx={{ color: "black" }}
                    row
                  >
                    <FormControlLabel
                      value="authorization-code"
                      control={<Radio />}
                      label="Authorization Code"
                    />
                    <FormControlLabel
                      value="service-account"
                      control={<Radio />}
                      label="Service Account"
                    />
                    <FormControlLabel
                      value="password"
                      control={<Radio />}
                      label="Password"
                    />
                  </RadioGroup>
                </FormControl>
                {flowType && (
                  <Box
                    sx={{
                      textAlign: "center",
                      height: "100vh",
                    }}
                  >
                    <TextField
                      name="discoveryUrl"
                      label="Discovery URL"
                      onChange={(e) => handleChange(e)}
                      value={formValues.discoveryUrl.value}
                      InputProps={{
                        endAdornment: validDiscoveryUrl && (
                          <CheckCircleIcon color="success" />
                        ),
                      }}
                    />

                    {!["service-account", "password"].includes(flowType) && (
                      <>
                        <TextField
                          name="authorizationUrl"
                          label="Authorization URL"
                          onChange={(e) => handleChange(e)}
                          value={formValues.authorizationUrl.value}
                          required
                          error={formValues.authorizationUrl.error}
                          helperText={
                            formValues.authorizationUrl.error &&
                            formValues.authorizationUrl.errorMessage
                          }
                        />
                        <TextField
                          name="forwardQueryParams"
                          label="Forward Query Params"
                          onChange={(e) => handleChange(e)}
                          value={formValues.forwardQueryParams.value}
                          helperText="param1=value1&param2=value2"
                        />

                        <TextField
                          name="userinfoUrl"
                          label="Userinfo URL"
                          onChange={(e) => handleChange(e)}
                          value={formValues.userinfoUrl.value}
                        />
                      </>
                    )}

                    <TextField
                      name="tokenUrl"
                      label="Token URL"
                      onChange={(e) => handleChange(e)}
                      value={formValues.tokenUrl.value}
                      error={formValues.tokenUrl.error}
                      helperText={
                        formValues.tokenUrl.error &&
                        formValues.tokenUrl.errorMessage
                      }
                      required
                    />

                    {!["service-account", "password"].includes(flowType) && (
                      <TextField
                        name="logoutUrl"
                        label="Logout URL"
                        onChange={(e) => handleChange(e)}
                        value={formValues.logoutUrl.value}
                      />
                    )}
                    <TextField
                      name="clientId"
                      label="Client ID"
                      onChange={(e) => handleChange(e)}
                      value={formValues.clientId.value}
                      required
                      error={formValues.clientId.error}
                      helperText={
                        formValues.clientId.error &&
                        formValues.clientId.errorMessage
                      }
                    />
                    <TextField
                      name="clientSecret"
                      label="Client Secret"
                      type={showClientSecret ? "text" : "password"}
                      onChange={(e) => handleChange(e)}
                      value={formValues.clientSecret.value}
                      required={flowType === "service-account"}
                      error={
                        flowType === "service-account" &&
                        formValues.clientSecret.error
                      }
                      helperText={
                        flowType === "service-account" &&
                        formValues.clientSecret.error &&
                        formValues.clientSecret.errorMessage
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle client secret visibility"
                              onClick={() =>
                                setShowClientSecret((show) => !show)
                              }
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end"
                            >
                              {showClientSecret ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {flowType === "password" && (
                      <>
                        <TextField
                          name="username"
                          label="Username"
                          onChange={(e) => handleChange(e)}
                          value={formValues.username.value}
                          required
                          error={formValues.username.error}
                          helperText={
                            formValues.username.error &&
                            formValues.username.errorMessage
                          }
                        />

                        <TextField
                          name="password"
                          label="Password"
                          required
                          type={showPassword ? "text" : "password"}
                          onChange={(e) => handleChange(e)}
                          value={formValues.password.value}
                          error={formValues.password.error}
                          helperText={
                            formValues.password.error &&
                            formValues.password.errorMessage
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() =>
                                    setShowPassword((show) => !show)
                                  }
                                  onMouseDown={(e) => e.preventDefault()}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </>
                    )}

                    <MultiSelect
                      onChange={setScopes}
                      label="Scopes"
                      defaultValue={["openid"]}
                      fixedOptions={["openid"]}
                    />
                    {!["service-account", "password"].includes(flowType) && (
                      <TextField
                        name="redirectUri"
                        label="Redirect URI"
                        onChange={(e) => handleChange(e)}
                        value={formValues.redirectUri.value}
                      />
                    )}
                    {authenticated ? (
                      <Button variant="contained" onClick={handleLogout}>
                        Logout
                      </Button>
                    ) : (
                      <Button variant="contained" type="submit">
                        Login
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={() => {
                        localStorage.removeItem("formValues");
                        localStorage.removeItem("flowType");
                        window.location.reload();
                      }}
                      color="error"
                      sx={{ marginLeft: 2 }}
                    >
                      Reset
                    </Button>
                  </Box>
                )}
              </form>
            </Box>
          </Paper>
        </Grid>
        {authenticated && (
          <Grid item xs={12} md={6}>
            <TokenData tokens={tokens} />
          </Grid>
        )}
      </Grid>
    </>
  );
}
