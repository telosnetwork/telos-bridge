import React from 'react';

import {styled} from '@/core/ui/system';

import {Icon} from './Icon';
import {Input} from './Input';

interface SearchBarProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
}

const InputWrapper = styled('div', {name: 'SearchBarWrapper'})(() => ({
  maxWidth: 'calc(100% - 32px)',
  margin: '0 auto',
  width: '100%',
  boxSizing: 'border-box',
}));

export const SearchBar = (props: SearchBarProps) => {
  const {value, onChange, ...inputProps} = props;
  return (
    <InputWrapper>
      <Input
        placeholder='Search'
        value={value}
        onChange={onChange}
        startAdornment={
          <Icon type='search' size={16} sx={{color: (t) => t.palette.text.secondary}} />
        }
        sx={{boxSizing: 'border-box'}}
        {...inputProps}
      />
    </InputWrapper>
  );
};

export function useSimpleSearch({items, searchKey}: {items: Array<any>; searchKey: string}) {
  const [query, setQuery] = React.useState('');
  const filteredItems = items.filter((item) => item[searchKey]?.toLowerCase()?.includes(query));
  return {
    filteredItems,
    query,
    setQuery,
  };
}
