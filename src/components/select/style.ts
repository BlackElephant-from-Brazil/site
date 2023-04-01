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
	transition: box-shadow 0.1s ease-in-out;

	:hover {
		box-shadow: 0px 0px 8px rgba(255, 255, 255, .75);
	}

	&.active {
		background: #fff;
		color: #000;
	}
`;
