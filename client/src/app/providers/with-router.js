import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StyledBackdrop } from 'shared/ui/backdrop';

export const withRouter = component => () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<StyledBackdrop />}>{component()}</Suspense>
      {/* <Suspense fallback="Loading...">{component()}</Suspense> */}
    </BrowserRouter>
  );
};
