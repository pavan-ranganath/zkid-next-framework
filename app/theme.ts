export const DEFAULT_THEME: "dark" | "light" = "dark";
// https://github.com/mui/material-ui/issues/34898#issuecomment-1506990380
export const getOtherTheme = (theme: string | undefined): "dark" | "light" => {
  switch (theme) {
    case "dark":
      return "light";
    case "light":
      return "dark";
    case "system":
    default:
      return DEFAULT_THEME;
  }
};