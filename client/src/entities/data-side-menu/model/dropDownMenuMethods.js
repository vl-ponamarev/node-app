import { Modal } from 'antd';

export const dropDownMenuMethods = new Map([
  [
    'delete',
    id => {
      return <Modal title="Are you sure?" open={id} />;
    },
  ],
]);
