/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';

export const Container = styled.textarea`
	padding: 20px;
	border: 1px solid #898989;
	border-radius: 8px;
	background: #000;
	color: #fff;
	font-size: 22px;
	width: 100%;
	height: 160px;

	&.error {
		border: 1px solid #ff6961;
	}
`;
