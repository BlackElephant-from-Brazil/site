import React from 'react';
import {Container} from './styles';

type ButtonProps = {
	startIcon?: React.ReactNode;
	text: string;
	className?: string;
	onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({text, className, onClick, startIcon}) =>
	(
		<Container className={className} onClick={onClick}>
			{startIcon}
			<p>
				{text}
			</p>
		</Container>
	);

