import React from 'react';
import {Container} from './styles';

type TextareaProps = {
	placeholder: string;
	errorMessage?: string;
	textareaRef?: React.Ref<HTMLTextAreaElement>;
};

export const Textarea: React.FC<TextareaProps> = ({placeholder, errorMessage, textareaRef}) => <Container placeholder={placeholder} className={errorMessage ? 'error' : ''} ref={textareaRef}></Container>;
