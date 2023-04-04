/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';

export const Container = styled.button`
	padding: 20px;
	border-radius: 10px;
	color: #000000;
	border: 0;
	background: linear-gradient(90.15deg, #FFFFFF 18.95%, rgba(255, 255, 255, 0) 168.98%);
	font-weight: 700;
	font-size: 24px;
	transition: 0.2s ease-in-out;
	display: flex;
	align-items: center;

	p {
		margin-left: 10px;
	}

	:hover {
		background: linear-gradient(90.15deg, #FFFFFF 18.95%, rgba(255, 255, 255, 0) 168.98%);
		box-shadow: 0px 0px 25px #FFFFFF;
	}
`;
