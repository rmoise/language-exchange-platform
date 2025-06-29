import { CircularProgress, Box } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress 
        sx={{ 
          color: '#6366f1' 
        }} 
      />
    </Box>
  );
}