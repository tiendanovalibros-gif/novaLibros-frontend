import React, { forwardRef } from "react";
// icons
import { Icon } from "@iconify/react";
// @mui
import Box from "@mui/material/Box";

// ----------------------------------------------------------------------

const Iconify = forwardRef(({ icon, width = 20, sx, className, ...other }: IconifyProps, ref) => (
  <Box
    ref={ref}
    component={Icon}
    className={`component-iconify ${className || ""}`}
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
));

type IconifyProps = {
  icon: string;
  width?: number;
  sx?: object;
  className?: string;
};

Iconify.displayName = "Iconify";
export default Iconify;
