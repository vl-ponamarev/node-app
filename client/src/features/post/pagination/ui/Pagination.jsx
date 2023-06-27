import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

const CustomizedStack = styled(Stack)`
  display: flex;
  align-items: center;
  margin: 30px;
`;

export default function PaginationOutlined({ count, page, onChange }) {
  return (
    <CustomizedStack spacing={2}>
      <Pagination
        variant="outlined"
        color="primary"
        count={count}
        page={page}
        onChange={onChange}
      />
    </CustomizedStack>
  );
}
