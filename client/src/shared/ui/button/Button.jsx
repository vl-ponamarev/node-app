import React from 'react';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const CustomizedButton = styled(Button)`
  height: 35px;
  width: 170px;
  border-radius: 5px;
  background: lightsteelblue;
  font-family: Manrope;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  line-height: 27px;
  letter-spacing: 0em;
  text-align: left;

  :hover {
    background: #gray;
    color: lightsteelblue;
  }
`;

export function StyledButton(props) {
  return <CustomizedButton {...props} />;
}
