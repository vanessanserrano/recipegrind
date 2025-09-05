import React from "react";
import { Alert, AlertTitle, Stack, Button } from "@mui/material";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Stack sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Something went wrong</AlertTitle>
          {String(this.state.error?.message ?? this.state.error ?? "Unknown error")}
        </Alert>
        <Button onClick={() => location.reload()}>Reload</Button>
      </Stack>
    );
  }
}
