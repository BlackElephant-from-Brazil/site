import React from 'react';
import {Container} from './style';

type SelectProps = {
	text: string;
	active?: boolean;
	onClick: () => void;
};

export const Select: React.FC<SelectProps> = ({text, active, onClick}) => (
	<Container className={active ? 'active' : ''} onClick={onClick}>{text}</Container>
);
