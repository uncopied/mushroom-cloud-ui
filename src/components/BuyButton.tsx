import { FunctionComponent } from 'react';
import algo_dark from '../assets/algo_dark.svg';
import { SButton } from '../utils';

const algoStyleSmall = {
  height: '1rem',
  marginLeft: '0.2rem',
};

interface BuyButtonProps {
  price: number;
  onBuyAsset: () => {};
}

const BuyButton: FunctionComponent<BuyButtonProps> = ({
  price,
  onBuyAsset,
}) => {
  return (
    <SButton className='pointer-fade' onClick={onBuyAsset}>
      <div className='flex'>
        {price}
        <img style={algoStyleSmall} src={algo_dark} alt='algos' />
      </div>
    </SButton>
  );
};

export default BuyButton;
