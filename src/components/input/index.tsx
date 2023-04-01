import React from 'react';
import {Container} from './styles';

type InputProps = {
	label: string;
	name: string;
	errorMessage?: string;
	inputRef?: React.Ref<HTMLInputElement>;
};

export const Input: React.FC<InputProps> = ({label, name, errorMessage, inputRef}) => (
	<Container className={errorMessage ? 'error' : ''}>
		<label htmlFor={name}>{label}</label>
		<input type='text' id={name} ref={inputRef} />
		{errorMessage && <span>{errorMessage}</span>}
	</Container>
);
