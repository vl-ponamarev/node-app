import React from 'react'
import { Backdrop } from '@mui/material'
import { StyledCircularProgress } from '../circularProgress'

export function StyledBackdrop() {
  return (
    <Backdrop sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
      <StyledCircularProgress />
    </Backdrop>
  )
}
