/* eslint-disable @typescript-eslint/naming-convention */
import styled from 'styled-components';

export const Container = styled.div`
	@media screen and (max-width: 1330px) {
		main {
			h2 {
				width: 600px;
				height: 200px !important;
			}
		}
	}

	.wrapper {
		padding-left: 72px;
		padding-right: 72px;
		max-width: 1440px;
		margin-left: auto;
		margin-right: auto;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 96px;
		position: fixed;
		top: 0;
		width: 100%;
		background: #000;
		z-index: 99;

		.wrapper {
			display: flex;
			justify-content: space-between;
			width: 100%;

			.image-logo-header {
				cursor: pointer;
			}

			nav {
				ul {
					list-style: none;
					display: flex;

					li {
						font-weight: 400;
						font-size: 24px;
						cursor: pointer;
						transition: 0.2s ease-in-out;

						:not(:first-child) {
							margin-left: 44px;
						}

						:hover {
							text-shadow: 0px 0px 24px rgba(255, 255, 255, 0.7);
						}
					}
				}
			}

		}

	}

	main {
		position: relative;
		margin-top: 136px;


		h1 {
			margin-top: 40px;
			font-weight: 400;
			font-size: 40px;
		}

		h2 {
			font-weight: 700;
			font-size: 50px;
			margin-top: 24px;
			max-width: 870px;
			height: 140px;

			.cursor {
				transform: translateY(8px);
				width: 35px;
				height: 12px;
				background: #fff;
				display: inline-block;
				animation: blink 1s infinite;

				@keyframes blink {
					50% {
						opacity: 0;
					}
				}

			}
		}

		.bt-lets-talk {
			margin-top: 40px;
		}

		.text-us {
			display: flex;
			margin-left: 100px;
			margin-top: 40px;
			animation-name: get-in-from-right-down;
			animation-duration: 1s;

			@keyframes get-in-from-right-down {
        from {
					transform: translate(450px, 100px);
					opacity: 0;
        }
        to {
					transform: translate(0, 0);
					opacity: 1;
        }
      }

			span {
				display: block;
				font-weight: 400;
				font-size: 24px;
				max-width: 280px;
				transform: translateY(24px);
				margin-left: 30px;
			}

		}

		.mobile-apps {
			position: absolute;
			top: -40px;
			right: -240px;
		}
	}
`;

export const OurClients = styled.section`
	margin-top: 240px;

	h3 {
		font-weight: 400;
		font-size: 30px;
	}

	ul {
		list-style: none;
		margin-top: 80px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;

		li {
			margin-bottom: 40px;

			:not(:first-child) {
				margin-left: 40px;
			}
		}
	}
`;

export const Services = styled.section`
	margin-top: 40px;

	h3 {
		font-weight: 400;
		font-size: 30px;
	}

	ul {
		list-style: none;
		margin-top: 50px;
		display: flex;
		flex-wrap: wrap;



		li {
			display: flex;
			flex-direction: column;
			position: relative;
			overflow: hidden;

			.inner-box-sm {
				max-width: 720px;
				width: 100%;
				padding-bottom: 40px;
			}

			.left-box {
				margin-left: auto;
				padding-left: 72px;
				justify-self: flex-end;
				padding-right: 40px;


			}

			.right-box {
				margin-right: auto;
				padding-right: 72px;
				justify-self: flex-start;
				padding-left: 40px;
				position: relative;

				.img-box {
					right: -32px;
				}
			}

			:not(:last-child) {
				width: 50%;
			}

			&.white-box {
				background: #FFFFFF;
				color: #000000;
			}

			&.blue-box {
				background: #005DFF;
			}

			&.green-box {
				background: #119B1E;
			}

			&.orange-box {
				background: #E05F3F;
				width: 100%;
				padding-bottom: 40px;

				.wrapper {
					position: relative;
					overflow-x: visible;
				}

				h5 {
					max-width: 100%;
				}

				p {
					max-width: unset;
				}

				.img-box {
					right: -32px;
				}
			}

			h4 {
				font-weight: 400;
				font-size: 100px;


			}

			h5 {
				font-weight: 700;
				font-size: 26px;
				max-width: 500px;

				@media screen and (max-width: 1330px) {
					max-width: 360px;
				}
			}

			p {
				font-weight: 400;
				font-size: 22px;
				margin-top: 14px;
			}

			.img-box {
				position: absolute;
				top: 0;
				right: -40px;
				width: 200px;
				height: 200px;
			}
		}
	}
`;

type OurProcessProps = {
	activeTab: number;
};

export const OurProcess = styled.section<OurProcessProps>`
	background: #fff;
	color: #000;
	padding-top: 40px;
	min-height: 700px;

	h3 {
		font-weight: 400;
		font-size: 30px;
	}

	ul {
		list-style: none;
	}

	.line {
		width: 36px;
		height: 2px;
		background: #000;
		margin: 0 auto;
		margin-top: 10px;
		transform: translateX(${({activeTab}) => activeTab === 0 ? -100 : 60}px);
		transition: 0.2s;
	}

	ul.title {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 60px;

		li {
			font-weight: 400;
			font-size: 22px;
			cursor: pointer;

			&:last-child {
				margin-left: 28px;
			}

			&.active {
				font-weight: 700;
			}
		}
	}

	.tab-container {
		display: flex;
		flex-direction: row;
	}

	ul.processes {
		display: flex;
		margin-top: 36px;
		justify-content: space-between;
		flex-wrap: wrap;
		width: 100%;


		&.ux-processes {
			${({activeTab}) => activeTab === 1 ? 'display: none' : ''}
		}

		&.dev-processes {
			${({activeTab}) => activeTab === 0 ? 'display: none' : ''}
		}


		> li {
			@media screen and (max-width: 1450px) {
				width: 276px;
			}

			@media screen and (max-width: 1330px) {
				width: 213px;

				h4 {
					hyphens: manual;

				}
			}

			width: 306px;
			border: 2px solid #000000;
			border-radius: 20px;
			padding: 24px;
			margin-bottom: 22px;
			display: flex;
			flex-direction: column;
			position: relative;

			&:not(:first-child) {
				margin-left: 22px;
			}

			h4 {
				font-weight: 700;
				font-size: 26px;
			}

			p {
				margin-top: 10px;
				font-weight: 400;
				font-size: 20px;
			}

			.right-arrow {
				position: absolute;
				right: -12px;
				top: 60px;
			}

			.tags {
				margin-top: 36px;
				display: flex;
				flex: 1;


				ul {
					margin-top: auto;
					display: flex;
					flex-wrap: wrap;

					li {
						background: #CDDFFF;
						border-radius: 10px;
						padding: 10px;
						font-weight: 400;
						font-size: 18px;
						color: #005DFF;
						margin-right: 10px;
						margin-bottom: 10px;
						width: fit-content;
						display: flex;
					}
				}
			}
		}
	}
`;

export const Depoiments = styled.section`
	background: #005DFF;
	padding-top: 40px;
	padding-bottom: 100px;

	h3 {
		font-weight: 400;
		font-size: 30px;
	}

	ul {
		list-style: none;
		margin-top: 50px;
		display: flex;
		justify-content: center;

		li {
			width: 600px;

			.person {
				display: flex;
				align-items: center;
				justify-content: center;


				.person-data {
					margin-left: 12px;

					h4 {
						font-weight: 700;
						font-size: 26px;
					}

					span {
						font-weight: 400;
						font-size: 26px;
						color: #BCBCBC;
					}
				}
			}

			p {
				position: relative;
				font-weight: 400;
				font-size: 22px;
				margin: 0 auto;
				margin-top: 30px;
				max-width: 550px;

				span {
					position: absolute;
					font-family: 'DM Serif Display';
					font-weight: 400;
					font-size: 100px;
					top: -40px;
					left: -45px;
				}
			}

		}
	}
`;

export const Contact = styled.section`
	display: flex;
	flex-direction: column;
	padding-top: 100px;
	padding-bottom: 72px;

	.content-contact {
		width: 777px;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		align-items: center;
	}

	.error-message {
		color: #ff6961;
		text-align: start;
		font-size: 18px;
		margin-top: 8px;
	}

	.error {
		color: #ff6961;

		h4 {
			color: #ff6961;
		}
	}

	h3 {
		font-weight: 700;
		font-size: 50px;
		text-align: center;
	}

	span {
		margin-top: 32px;
		font-weight: 400;
		font-size: 30px;
		text-align: center;
	}

	form {
		margin-top: 60px;
		width: 100%;

		.budget {
			display: flex;
			flex-direction: column;
			margin-top: 60px;

			h4 {
				font-weight: 700;
				font-size: 22px;
				margin-bottom: 22px;
			}
		}

		.describe-your-project {
			margin-top: 60px;
			display: flex;
			flex-direction: column;

			h4 {
				font-weight: 700;
				font-size: 22px;
				margin-bottom: 22px;
			}
		}

		.message {
			margin-top: 40px;
			display: flex;
			flex-direction: column;

			h4 {
				font-weight: 700;
				font-size: 22px;
				margin-bottom: 32px;
			}

			.bt-send {
				margin: 0 auto;
				margin-top: 60px;
			}
		}
	}
`;

export const Footer = styled.footer`
	display: flex;
	align-items: center;
	background: #fff;
	color: #000;
	padding: 20px;

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;

		.footer-left-content {
			span {
				:first-child {
					padding-right: 28px;
					border-right: 1px solid #000;
				}

				:last-child {
					margin-left: 28px;
				}
			}
		}

		.footer-right-content {
			display: flex;

			span {
				:first-child {
					padding-right: 28px;
					border-right: 1px solid #000;
				}

				padding-left: 28px;
				padding-right: 28px;
				cursor: pointer;

				> a {
					font-style: unset;
					color: #000;
					text-decoration: none;
					font-weight: 400;
					font-size: 18px;
				}
			}
		}

		span {
			font-weight: 400;
			font-size: 18px;
		}

		ul {
			list-style: none;
			display: flex;
			margin-left: auto;

			li {
				cursor: pointer;
				width: 24px;
				height: 24px;
			}

			li:not(:last-child) {
				margin-right: 10px;
			}
		}
	}

`;
