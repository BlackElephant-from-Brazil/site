/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';

export const Container = styled.a`
	padding: 10px 20px;
	font-weight: 400;
	font-size: 22px;
	background: #2E2E2E;
	border-radius: 25px;
	width: fit-content;
	margin-bottom: 22px;
	cursor: pointer;
	transition: 0.2s ease-in-out;

	:hover {
		background: #898989;
	}

	&.active {
		background: #fff;
		color: #000;
	}
`;
