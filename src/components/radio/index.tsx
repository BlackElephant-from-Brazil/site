import React from 'react';
import {Container} from './styles';

type RadioProps = {
	label: string;
	active?: boolean;
	onClick?: () => void;
	name: string;
	id: string;
};

export const Radio: React.FC<RadioProps> = ({label, active, onClick, name, id}) => (
	<Container className={active ? 'active' : ''} onClick={onClick}>
		<input type='radio' name={name} id={id} />
		<label htmlFor={id}>{label}</label>
	</Container>
);
