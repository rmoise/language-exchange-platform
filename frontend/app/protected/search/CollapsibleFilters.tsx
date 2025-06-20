'use client'

import { useState } from 'react'
import { Box, Button, Collapse, Typography } from '@mui/material'
import { 
  Tune as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import SearchFilters from './SearchFilters'

export default function CollapsibleFilters() {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <Box sx={{ px: { xs: 1, lg: 0 }, mb: { xs: 1, lg: 2 } }}>
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setFiltersOpen(!filtersOpen)}
        sx={{
          width: '100%',
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: 2,
          color: 'white',
          textTransform: 'none',
          justifyContent: 'space-between',
          '&:hover': {
            backgroundColor: 'rgba(20, 20, 20, 0.8)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Filters
          </Typography>
        </Box>
        {filtersOpen ? (
          <ExpandLessIcon sx={{ fontSize: 20 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 20 }} />
        )}
      </Button>

      {/* Collapsible Filter Content */}
      <Collapse in={filtersOpen}>
        <Box sx={{
          mt: 1,
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 1.5,
          p: 2
        }}>
          <SearchFilters />
        </Box>
      </Collapse>
    </Box>
  )
}