import React from 'react'
import { styled } from '@mui/material/styles'
import { CircularProgress } from '@mui/material'

const CustomizedCircularProgress = styled(CircularProgress)`
  color: inherit;
`
export function StyledCircularProgress() {
  return <CustomizedCircularProgress />
}
