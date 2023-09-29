import {styled} from '@/core/ui/system';

const BarRoot = styled('div', {name: 'Bar'})(({theme}) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: theme.palette.text.primary,
  flexWrap: 'wrap',
  paddingTop: 24,
  paddingBottom: 24,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  maxWidth: 1440,
  margin: '0 auto',
  rowGap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
  },
}));

const Section = styled('div', {name: 'BarSection'})(({theme}) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
}));

const Item = styled('div', {name: 'BarItem'})(() => ({
  marginRight: 40,
}));

const Bar: typeof BarRoot & {Section: typeof Section; Item: typeof Item} = Object.assign(BarRoot, {
  Section,
  Item,
});

export {Bar};
