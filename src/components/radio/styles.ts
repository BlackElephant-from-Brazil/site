/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';

export const Container = styled.div`
	cursor: pointer;
	position: relative;

	:not(:last-child) {
		margin-bottom: 20px;
	}

	input[type='radio']:after {
		cursor: pointer;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		top: -6px;
		left: -5px;
		position: relative;
		background-color: #000000;
		content: '';
		display: inline-block;
		visibility: visible;
		border: 2px solid #898989;
	}

	input[type='radio']:checked:after {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		top: -6px;
		left: -5px;
		position: relative;
		background-color: #ffffff;
		content: '';
		display: inline-block;
		visibility: visible;
		border: 2px solid white;
	}

	input[type='radio']:checked:before {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		top: 5px;
		left: -3px;
		position: absolute;
		background-color: #ffffff;
		content: '';
		display: inline-block;
		visibility: visible;
		border: 4px solid #000000;
		z-index: 99;
	}

	input[type='radio']:checked + label {
		font-weight: 700;
	}

	label {
		font-weight: 400;
		font-size: 22px;
		margin-left: 16px;
		cursor: pointer;
	}
`;
