"use client";

import { IconButton, IconButtonProps } from "@mui/material";
import { EditOutlined as EditOutlinedIcon, Edit as EditIcon } from "@mui/icons-material";

interface EditIconButtonProps extends Omit<IconButtonProps, "children"> {
  size?: "small" | "medium" | "large";
  variant?: "solid" | "outlined";
}

const EditIconButton: React.FC<EditIconButtonProps> = ({
  size = "medium",
  variant = "outlined",
  sx,
  ...props
}) => {
  const iconSize = size === "small" ? 14 : size === "large" ? 18 : 16;
  const buttonSize = size === "small" ? 24 : size === "large" ? 36 : 32;
  const IconComponent = variant === "solid" ? EditIcon : EditOutlinedIcon;

  return (
    <IconButton
      {...props}
      sx={{
        width: buttonSize,
        height: buttonSize,
        backgroundColor: "white",
        border: "1px solid white",
        color: "#666",
        "&:hover": {
          backgroundColor: "white",
        },
        ...sx,
      }}
    >
      <IconComponent sx={{ fontSize: iconSize }} />
    </IconButton>
  );
};

export default EditIconButton;
