'use client'

import { useState } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Typography,
  Alert,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { useAppDispatch } from '@/lib/hooks'
import { updateUser } from '@/features/auth/authSlice'
import { api } from '@/utils/api'

const AVAILABLE_LANGUAGES = [
  'English',
  'Spanish',
  'French', 
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Finnish',
  'Polish',
  'Turkish',
  'Greek',
  'Hebrew',
]

interface LanguageFormProps {
  initialNative: string[]
  initialTarget: string[]
}

export default function LanguageForm({ initialNative, initialTarget }: LanguageFormProps) {
  const [nativeLanguages, setNativeLanguages] = useState<string[]>(initialNative)
  const [targetLanguages, setTargetLanguages] = useState<string[]>(initialTarget)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()

  const handleNativeChange = (event: SelectChangeEvent<typeof nativeLanguages>) => {
    const value = event.target.value
    setNativeLanguages(typeof value === 'string' ? value.split(',') : value)
    setSuccess(false)
    setError(null)
  }

  const handleTargetChange = (event: SelectChangeEvent<typeof targetLanguages>) => {
    const value = event.target.value
    setTargetLanguages(typeof value === 'string' ? value.split(',') : value)
    setSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await api.put('/users/me/languages', {
        native: nativeLanguages,
        target: targetLanguages,
      })

      // Update user in Redux store
      dispatch(updateUser(response.data.data))
      setSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update languages')
    } finally {
      setIsLoading(false)
    }
  }

  const renderLanguageChips = (languages: string[], onDelete: (lang: string) => void) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      {languages.map((lang) => (
        <Chip
          key={lang}
          label={lang}
          onDelete={() => onDelete(lang)}
          size="small"
          sx={{
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            '& .MuiChip-deleteIcon': {
              color: '#6366f1',
              '&:hover': {
                color: '#4f46e5',
              }
            }
          }}
        />
      ))}
    </Box>
  )

  const removeNativeLanguage = (lang: string) => {
    setNativeLanguages(prev => prev.filter(l => l !== lang))
  }

  const removeTargetLanguage = (lang: string) => {
    setTargetLanguages(prev => prev.filter(l => l !== lang))
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            '& .MuiAlert-icon': {
              color: '#4ade80'
            }
          }}
        >
          Languages updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-icon': {
              color: '#fca5a5'
            }
          }}
        >
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#6366f1',
            }
          }}
        >
          Native Languages
        </InputLabel>
        <Select
          multiple
          value={nativeLanguages}
          onChange={handleNativeChange}
          input={
            <OutlinedInput 
              label="Native Languages"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 1,
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1',
                  borderWidth: 1,
                },
              }}
            />
          }
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip 
                  key={value} 
                  label={value} 
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '& .MuiMenuItem-root': {
                  color: 'white',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.3)',
                    }
                  }
                }
              }
            }
          }}
        >
          {AVAILABLE_LANGUAGES
            .filter(lang => !nativeLanguages.includes(lang))
            .map((language) => (
              <MenuItem key={language} value={language}>
                {language}
              </MenuItem>
            ))}
        </Select>
        <Typography 
          sx={{ 
            mt: 1, 
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}
        >
          Languages you speak fluently
        </Typography>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#a855f7',
            }
          }}
        >
          Target Languages
        </InputLabel>
        <Select
          multiple
          value={targetLanguages}
          onChange={handleTargetChange}
          input={
            <OutlinedInput 
              label="Target Languages"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 1,
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a855f7',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#a855f7',
                  borderWidth: 1,
                },
              }}
            />
          }
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip 
                  key={value} 
                  label={value} 
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#a855f7',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '& .MuiMenuItem-root': {
                  color: 'white',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(168, 85, 247, 0.3)',
                    }
                  }
                }
              }
            }
          }}
        >
          {AVAILABLE_LANGUAGES
            .filter(lang => !targetLanguages.includes(lang))
            .map((language) => (
              <MenuItem key={language} value={language}>
                {language}
              </MenuItem>
            ))}
        </Select>
        <Typography 
          sx={{ 
            mt: 1, 
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}
        >
          Languages you want to learn
        </Typography>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        startIcon={<Save />}
        disabled={isLoading}
        sx={{ 
          mt: 2,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          color: 'white',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          py: 1.5,
          px: 3,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            borderColor: 'rgba(99, 102, 241, 0.5)',
          },
          '&:disabled': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        {isLoading ? 'Saving...' : 'Save Languages'}
      </Button>
    </Box>
  )
}