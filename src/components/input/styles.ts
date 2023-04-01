/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 20px;

	label {
		font-weight: 400;
		font-size: 22px;
	}

	input {
		margin-top: 8px;
		background: #000;
		border: 1px solid #898989;
		border-radius: 8px;
		color: #fff;
		height: 50px;
		font-size: 22px;
		padding: 16px;

		:focus {
			border: 1px solid #ffffff;
		}


	}

	&.error {
		label {
			color: #ff6961;
		}

		input {
			border: 1px solid #ff6961;
		}

		span {
			color: #ff6961;
			text-align: start;
			font-size: 18px;
			margin-top: 8px;
		}
	}
`;
