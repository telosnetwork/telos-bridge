import {keyframes, styled} from '@/core/ui/system';

interface SwapButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  iconSize?: number;
}

const swipeDown = keyframes({
  '20%': {
    transform: 'translateY(0%)',
    opacity: 1,
  },
  '40%': {
    transform: 'translateY(100%)',
    opacity: 0,
  },
  '41%': {
    transform: 'translateY(-100%)',
  },
  '42%': {
    opacity: 1,
  },
  '70%': {
    transform: 'translateY(0%)',
    opacity: 1,
  },
});

const swipeUp = keyframes({
  '20%': {
    transform: 'translateY(0%)',
    opacity: 1,
  },
  '40%': {
    transform: 'translateY(-100%)',
    opacity: 0,
  },
  '41%': {
    transform: 'translateY(100%)',
  },
  '42%': {
    opacity: 1,
  },
  '70%': {
    transform: 'translateY(0%)',
    opacity: 1,
  },
});

const Button = styled('button', {name: 'SwapButton'})(({theme}) => ({
  height: '60px',
  margin: '15px 0px',
  backgroundColor: 'transparent',
  border: '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.palette.text.primary,
  '&:focus': {
    outline: '0',
    filter: 'brightness(1.5)',
  },
  '&:focus path:first-of-type, &:hover path:first-of-type': {
    animation: `1s ${swipeDown} ease-out`,
  },
  '&:focus path:nth-of-type(2), &:hover path:nth-of-type(2)': {
    animation: `1s ${swipeUp} ease-out`,
  },
}));

export const SwapButton = (props: SwapButtonProps) => {
  const {iconSize = 50} = props;
  return (
    <Button {...props}>
      <svg
        viewBox='0 0 24 24'
        width={iconSize}
        height={iconSize}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M19.3582 15.2117L13.4999 21.2307L13.4999 3.00011L14.4999 3.00011L14.4999 18.7695L18.6416 14.5143L19.3582 15.2117Z'
          fill='currentColor'
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M4.6416 8.7885L10.4999 2.76953L10.4999 21.0001L9.49991 21.0001L9.4999 5.23069L5.35821 9.48597L4.6416 8.7885Z'
          fill='currentColor'
        />
      </svg>
    </Button>
  );
};
