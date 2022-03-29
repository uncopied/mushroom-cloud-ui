import { FunctionComponent } from 'react';
import { SButton } from '../utils';

interface SellButtonProps {
  onSellAsset: () => {};
}

const SellButton: FunctionComponent<SellButtonProps> = ({
  onSellAsset,
}: SellButtonProps) => {
  return <SButton onClick={onSellAsset}>Put on Sale</SButton>;
};

export default SellButton;
