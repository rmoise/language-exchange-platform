"use client";

import { IconButton, IconButtonProps } from "@mui/material";
import { EditOutlined as EditOutlinedIcon } from "@mui/icons-material";

interface EditIconButtonProps extends Omit<IconButtonProps, "children"> {
  size?: "small" | "medium" | "large";
}

const EditIconButton: React.FC<EditIconButtonProps> = ({
  size = "medium",
  sx,
  ...props
}) => {
  const iconSize = size === "small" ? 14 : size === "large" ? 18 : 16;
  const buttonSize = size === "small" ? 24 : size === "large" ? 36 : 32;

  return (
    <IconButton
      {...props}
      sx={{
        width: buttonSize,
        height: buttonSize,
        backgroundColor: "transparent",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        color: "rgba(255, 255, 255, 0.8)",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "white",
          color: "#000",
          borderColor: "white",
        },
        ...sx,
      }}
    >
      <EditOutlinedIcon sx={{ fontSize: iconSize }} />
    </IconButton>
  );
};

export default EditIconButton;
