import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';
import {Container, Services, OurClients, OurProcess, Depoiments, Footer, Contact} from '../styles/styles';
import {Helmet} from 'react-helmet';
import GlobalStyle from '../styles/global-styles';
import {Button} from '../components/button';
import {Input} from '../components/input';
import {Select} from '../components/select';
import {Textarea} from '../components/textarea';
import {Radio} from '../components/radio';

const IndexPage = () => {
	const [weHelpYouInText, setWeHelpYouInText] = React.useState('Ter o software que você precisa');
	const [tabProcessActive, setTabProcessActive] = React.useState(0);
	const [selectedProjectDescription, setSelectedProjectDescription] = React.useState(-1);
	const [nameErrorMessage, setNameErrorMessage] = React.useState('');
	const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
	const [phoneErrorMessage, setPhoneErrorMessage] = React.useState('');
	const [messageErrorMessage, setMessageErrorMessage] = React.useState('');
	const [budgetErrorMessage, setBudgetErrorMessage] = React.useState('');
	const [projectDescriptionErrorMessage, setProjectDescriptionErrorMessage] = React.useState('');
	const [selectedBudget, setSelectedBudget] = React.useState(0);
	const homeRef = React.useRef<HTMLDivElement>(null);
	const servicesRef = React.useRef<HTMLDivElement>(null);
	const ourProcessesRef = React.useRef<HTMLDivElement>(null);
	const depoimentsRef = React.useRef<HTMLDivElement>(null);
	const contactRef = React.useRef<HTMLDivElement>(null);
	const nameRef = React.useRef<HTMLInputElement>(null);
	const emailRef = React.useRef<HTMLInputElement>(null);
	const phoneRef = React.useRef<HTMLInputElement>(null);
	const messageRef = React.useRef<HTMLTextAreaElement>(null);

	const handleGoToSection = (ref: React.RefObject<HTMLDivElement>) => {
		const section = ref.current;
		if (section) {
			section.scrollIntoView({behavior: 'smooth'});
		}
	};

	const handleContactFormSubmit = () => {
		setNameErrorMessage('');
		setEmailErrorMessage('');
		setPhoneErrorMessage('');
		setBudgetErrorMessage('');
		setProjectDescriptionErrorMessage('');
		setMessageErrorMessage('');
		const name = nameRef.current?.value;
		const email = emailRef.current?.value;
		const phone = phoneRef.current?.value;
		const message = messageRef.current?.value;

		if (!name) {
			setNameErrorMessage('Preencha o campo nome');
			handleGoToSection(contactRef);
		}

		if (!email) {
			setEmailErrorMessage('Preencha o campo email');
			handleGoToSection(contactRef);
		}

		if (email) {
			const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
			if (!emailRegex.test(email)) {
				setEmailErrorMessage('Preencha um email válido');
				handleGoToSection(contactRef);
			}
		}

		if (!phone) {
			setPhoneErrorMessage('Preencha o campo telefone');
			handleGoToSection(contactRef);
		}

		if (selectedBudget === 0) {
			setBudgetErrorMessage('Fale para nós qual o seu orçamento');
			handleGoToSection(contactRef);
		}

		if (selectedProjectDescription === -1) {
			setProjectDescriptionErrorMessage('Deixe-nos saber mais sobre seu projeto');
		}

		if (!message) {
			setMessageErrorMessage('Preencha o campo mensagem');
		}
	};

	return (
		<React.Fragment>
			<Helmet>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
				<link href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap' rel='stylesheet' />
				<link href='https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap' rel='stylesheet'></link>
				<title>BlackElephant do Brasil</title>
				<link rel='icon' type='image/jpeg' href='/favicon.jpeg' />
				<meta
					name='description'
					content='BlackElephant do Brasil. A empresa que vai revolucionar o mercado de software nacional.'
				/>
				<meta name='referrer' content='origin' />
			</Helmet>
			<GlobalStyle />
			<Container ref={homeRef}>
				<header className='wrapper'>
					<StaticImage
						src='../images/blackelephant-logo.png'
						alt='Logo da maior empresa da américa latina de desenvolvimento e softwares e UX'
						onClick={() => {
							handleGoToSection(homeRef);
						}}
					/>
					<nav>
						<ul>
							<li onClick={() => {
								handleGoToSection(servicesRef);
							}
							}>Serviços</li>
							<li onClick={() => {
								handleGoToSection(ourProcessesRef);
							}}>Nossos processo</li>
							<li onClick={() => {
								handleGoToSection(depoimentsRef);
							}}>Depoimentos</li>
							<li onClick={() => {
								handleGoToSection(contactRef);
							}}>Contato</li>
						</ul>
					</nav>
				</header>
				<main className='wrapper'>
					<h1>Nós ajudamos você a</h1>
					<h2>{weHelpYouInText}</h2>
					<Button text='Vamos conversar' className='bt-lets-talk' startIcon={
						<StaticImage
							src='../images/send.svg'
							alt='Ícone de avião indicando envio de mensagem'
						/>
					}
					onClick={() => {
						handleGoToSection(contactRef);
					}}
					/>
					<div className='text-us'>
						<StaticImage
							src='../images/arrow.svg'
							alt='Ícone de uma seta indicando para que você se comunique conosco'
						/>
						<span>Mande um alô para a gente, é rapidinho!</span>
					</div>
					<StaticImage
						src='../images/mobile-app.png'
						alt='Imagem ilustrativa de um serviço realizado pela BlackElephant'
						className='mobile-apps'
					/>
				</main>
				<OurClients className='wrapper'>
					<h3>
						Confiam em nosso trabalho
					</h3>

					<ul>
						<li>
							<StaticImage
								src='../images/dm11.png'
								alt='Logo da empresa DM11' />
						</li>
						<li>
							<StaticImage
								src='../images/nosconformes.png'
								alt='Logo da empresa Nosconformes' />
						</li>
						<li>
							<StaticImage
								src='../images/quanyx.png'
								alt='Logo da empresa Quanyx' />
						</li>
						<li>
							<StaticImage
								src='../images/melhor-lugar.png'
								alt='Logo da empresa Melhor Lugar' />
						</li>
						<li>
							<StaticImage
								src='../images/kickoff-music.png'
								alt='Logo da empresa KickOff Music' />
						</li>
					</ul>

				</OurClients>
				<Services ref={servicesRef}>
					<h3>
						<div className='wrapper'>

						Serviços
						</div>
					</h3>
					<ul>
						<li className='black-box'>
							<div className='inner-box-sm left-box'>
								<h4>1</h4>
								<h5>Desenvolvemos o seu software</h5>
								<p>Está na pista para inovar criando uma aplicação incrível? Conte com a gente para tirar sua ideia do papel e fazer acontecer.</p>
								<StaticImage
									className='img-box'
									src='../images/codepen.png'
									alt='Ícone de uma seta indicando para que você se comunique conosco'
								/>
							</div>

						</li>
						<li className='white-box'>
							<div className='inner-box-sm right-box'>
								<h4>2</h4>
								<h5>Alocamos uma equipe no seu time</h5>
								<p>Está querendo ajuntar um time de craques em tecnologia, a gente cuida disso para você! Estamos prontos para te ajudar em todas as etapas do projeto.</p>
								<StaticImage
									className='img-box'
									src='../images/users.png'
									alt='Ícone de uma seta indicando para que você se comunique conosco'
								/>
							</div>
						</li>
						<li className='blue-box'>
							<div className='inner-box-sm left-box'>
								<h4>3</h4>
								<h5>Automatizamos seus processos internos</h5>
								<p>Esqueça processos manuais e demorados, nós automatizamos seus processos internos de forma criativa e eficiente, em um piscar de olhos. </p>
								<StaticImage
									className='img-box'
									src='../images/bar-chart.png'
									alt='Ícone de uma seta indicando para que você se comunique conosco'
								/>
							</div>
						</li>
						<li className='green-box'>
							<div className='inner-box-sm right-box'>
								<h4>4</h4>
								<h5>Validamos sua ideia no mercado bem antes de ser lançada</h5>
								<p>Com nossa metodologia de UX Strategy, mergulhamos fundo no mercado e encontramos oportunidades incríveis que podem ser o grande diferencial do seu negócio.</p>
								<StaticImage
									className='img-box'
									src='../images/gift.png'
									alt='Ícone de uma seta indicando para que você se comunique conosco'
								/>
							</div>
						</li>
						<li className='orange-box'>
							<div className='wrapper'>
								<h4>5</h4>
								<h5>Criamos estratégias para inserir seu produto no mercado</h5>
								<p>Nosso processo validado é a chave para a inovação! Com ele, ajudamos a lançar novas startups no mercado e criamos soluções que revolucionam o mundo dos negócios. Vamos transformar sua ideia em realidade e fazer acontecer!</p>
								<StaticImage
									className='img-box'
									src='../images/box.png'
									alt='Ícone de uma seta indicando para que você se comunique conosco'
								/>
							</div>
						</li>
					</ul>
				</Services>

				<OurProcess activeTab={tabProcessActive} ref={ourProcessesRef}>
					<div className='wrapper'>
						<h3>
							Nosso processo
						</h3>
						<ul className='title'>
							<li className={tabProcessActive === 0 ? 'active' : ''} onClick={() => {
								setTabProcessActive(0);
							}}>UX Design</li>
							<li className={tabProcessActive === 1 ? 'active' : ''} onClick={() => {
								setTabProcessActive(1);
							}}>Desenvolvimento</li>
						</ul>
						<div className='line'>
						</div>
						<ul className='processes ux-processes'>
							<li>
								<h4>
									Mergulho no negócio
								</h4>
								<p>
									Compreendemos mais sobre as necessidades e desejos do seu negócio
								</p>
								<StaticImage src='../images/right-arrow.png' alt='Seta indicando a direção do processo' className='right-arrow'/>
								<div className='tags'>
									<ul>
										<li>Workshops</li>
										<li>Survey</li>
										<li>Analytics</li>
									</ul>
								</div>
							</li>
							<li>
								<h4>
									Pesquisa com usuários
								</h4>
								<p>
									Entendemos o problema conduzindo em profundidade com uma pesquisa primária
								</p>
								<StaticImage src='../images/right-arrow.png' alt='Seta indicando a direção do processo' className='right-arrow'/>
								<div className='tags'>
									<ul>
										<li>Usabilidade</li>
										<li>Entrevistas</li>
									</ul>
								</div>
							</li>
							<li>
								<h4>
									Idealizar
								</h4>
								<p>
									Rapidamente idealizar soluções mapeando jornadas e definindo a arquitetura
								</p>
								<StaticImage src='../images/right-arrow.png' alt='Seta indicando a direção do processo' className='right-arrow'/>
								<div className='tags'>
									<ul>
										<li>Matriz CSD</li>
										<li>Personas</li>
										<li>Canvas BM</li>
									</ul>
								</div>
							</li>
							<li>
								<h4>
									Materialização
								</h4>
								<p>
									Projetar produtos bonitos, usáveis e de marca que atendam seus objetivos
								</p>
								<div className='tags'>
									<ul>
										<li>Prototipação</li>
										<li>UI</li>
									</ul>
								</div>
							</li>
						</ul>
						<ul className='processes dev-processes'>
							<li>
								<h4>
									Arq. da informação
								</h4>
								<p>
									Organização da estrutura lógica dos dados do sistema
								</p>
								<StaticImage src='../images/right-arrow.png' alt='Seta indicando a direção do processo' className='right-arrow'/>
								<div className='tags'>
									<ul>
										<li>DB</li>
										<li>ERD</li>
										<li>Diagrama</li>
									</ul>
								</div>
							</li>
							<li>
								<h4>
									Mão na massa
								</h4>
								<p>
									Programar todo o sistema seguindo as decisões tomadas pelos processos anteriores.
								</p>
								<StaticImage src='../images/right-arrow.png' alt='Seta indicando a direção do processo' className='right-arrow'/>
								<div className='tags'>
									<ul>
										<li>Front-end</li>
										<li>Back-end</li>
										<li>API</li>
									</ul>
								</div>
							</li>
							<li>
								<h4>
									QA
								</h4>
								<p>
									Realização de testes para validação do bom funcionamento do projeto
								</p>
								<StaticImage src='../images/right-arrow.png' alt='Seta indicando a direção do processo' className='right-arrow'/>
								<div className='tags'>
									<ul>
										<li>Matriz CSD</li>
										<li>Personas</li>
										<li>Canvas BM</li>
									</ul>
								</div>
							</li>
							<li>
								<h4>
									Suporte
								</h4>
								<p>
									Manutenção, tratamento de bugs, evolução do projeto e novas demandas
								</p>
								<div className='tags'>
									<ul>
										<li>CI/CD</li>
										<li>AWS</li>
										<li>Netlify</li>
									</ul>
								</div>
							</li>
						</ul>
					</div>

				</OurProcess>
				<Depoiments ref={depoimentsRef}>
					<div className='wrapper'>
						<h3>
						Depoimentos
						</h3>
						<ul>
							<li>
								<div className='person'>
									<StaticImage
										src='../images/vladimir.png'
										alt='Foto de nosso cliente satisfeito Vladimir' />
									<div className='person-data'>
										<h4>Vladimir Scarlassara</h4>
										<span>CEO Quanyx</span>
									</div>
								</div>
								<p>
									<span>“</span> Aceitaram o desafio de um desenvolvimento de um protocolo para geração de nuvem de pontos de câmera 3D e deram conta do recado. Novas contratações virão certamente. Excelente equipe.
								</p>
							</li>
						</ul>
					</div>
				</Depoiments>
				<Contact ref={contactRef}>
					<div className='wrapper content-contact'>
						<h3>
						Que tal conversarmos?
						</h3>
						<span>
						Marque um papo conosco. Estamos mega ansiosos para te conhecer.
						</span>
						<form onSubmit={e => {
							e.preventDefault();
						}}
						>
							<Input label='Nome completo' name='name' errorMessage={nameErrorMessage} inputRef={nameRef} />
							<Input label='Seu email comercial' name='email' errorMessage={emailErrorMessage} inputRef={emailRef} />
							<Input label='Whatsapp ou telefone' name='whatsapp' errorMessage={phoneErrorMessage} inputRef={phoneRef} />
							<div className={budgetErrorMessage ? 'budget error' : 'budget'}>
								<h4>
									Budget {'(orçamento)'}
								</h4>
								<Radio label='R$ 10.000 - R$ 25.000,00' name='budget' id='first-budget' onClick={() => {
									setSelectedBudget(1);
								}} />
								<Radio label='R$ 25.000 - R$ 50.000' name='budget' id='second-budget' onClick={() => {
									setSelectedBudget(2);
								}} />
								<Radio label='R$ 50.000 - R$ 100.000' name='budget' id='third-budget' onClick={() => {
									setSelectedBudget(3);
								}} />
								<Radio label='Acima de R$ 100.000' name='budget' id='fourth-budget' onClick={() => {
									setSelectedBudget(4);
								}} />
								<Radio label='Ainda não financiado' name='budget' id='fiveth-budget' onClick={() => {
									setSelectedBudget(5);
								}} />
								{
									budgetErrorMessage && (
										<span className='error-message'>
											{budgetErrorMessage}
										</span>
									)
								}
							</div>

							<div className={projectDescriptionErrorMessage ? 'describe-your-project error' : 'describe-your-project'}>
								<h4>Descreva seu projeto</h4>
								<Select text='Tô afim de desenvolver um software, bora?' onClick={() => {
									setSelectedProjectDescription(1);
								}} active={selectedProjectDescription === 1} />
								<Select text='Quero encaixar uma equipe top no meu time' onClick={() => {
									setSelectedProjectDescription(2);
								}} active={selectedProjectDescription === 2} />
								<Select text='Tô bolando um negócio e gostaria de validar minha ideia' onClick={() => {
									setSelectedProjectDescription(3);
								}} active={selectedProjectDescription === 3} />
								<Select text='Tô pronto pronto para inserir meu produto no mercado' onClick={() => {
									setSelectedProjectDescription(4);
								}} active={selectedProjectDescription === 4} />
								<Select text='Quero dar um up nos processos internos da minha empresa' onClick={() => {
									setSelectedProjectDescription(5);
								}} active={selectedProjectDescription === 5} />
								{
									projectDescriptionErrorMessage && (
										<span className='error-message'>
											{projectDescriptionErrorMessage}
										</span>
									)
								}
							</div>

							<div className={messageErrorMessage ? 'message error' : 'message'}>
								<h4>Tem mais alguma coisa legal para compartilhar com a gente?</h4>
								<Textarea
									placeholder='Conte-nos sobre seu produto, o momento atual, quais são suas expectativas, como você ouviu falar da gente. Ou apenas diga um oi.'
									errorMessage={messageErrorMessage}
									textareaRef={messageRef}
								/>
								{
									messageErrorMessage && (
										<span className='error-message'>
											{messageErrorMessage}
										</span>
									)
								}
								<Button text='Enviar' className='bt-send' startIcon={
									<StaticImage
										src='../images/send.svg'
										alt='Ícone de avião indicando envio de mensagem'
									/>
								}
								onClick={handleContactFormSubmit}
								/>
							</div>
						</form>
					</div>
				</Contact>
				<Footer>
					<div className='wrapper footer-content'>
						<span>
							Política de privacidade
						</span>
						<span className='rights'>
							Todos os direitos reservados ©
						</span>
						<ul>
							<li>
								<a href='https://www.instagram.com/blackelephant.br/' target='_blank' rel='noreferrer'>
									<StaticImage
										src='../images/instagram.png'
										alt='Ícone do Instagram que irá te redirecionar à nossa página' />
								</a>
							</li>
							<li>
								<a href='https://www.linkedin.com/company/blackelephant/' target='_blank' rel='noreferrer'>
									<StaticImage
										src='../images/linkedin.png'
										alt='Ícone do LinkedIn que irá te redirecionar à nossa página' />
								</a>
							</li>
						</ul>
					</div>
				</Footer>
			</Container>
		</React.Fragment>
	);
};

export default IndexPage;
