const gameMenu: HTMLElement = document.querySelector('#game-menu');
/* form elements */
const gameMenuForm: HTMLFormElement = gameMenu.querySelector('.game-menu-form');
const menuFormOptions: NodeListOf<HTMLInputElement> = gameMenuForm.querySelectorAll('input[type="radio"]');
const menuErrorMsg: HTMLElement = gameMenuForm.querySelector('[role="alert"]');
const menuFormSubmitButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('button[type="submit"]');
/* game view: container with header, game board and scores */
const ticTacToeGameView: HTMLElement = document.querySelector('#tic-tac-toe-game');
const p1NameElement: HTMLElement = document.querySelector('#p1-game-name');
const p1ScoreElement: HTMLElement = document.querySelector('#p1-game-score');
const p2NameElement: HTMLElement = document.querySelector('#p2-game-name');
const p2ScoreElement: HTMLElement = document.querySelector('#p2-game-score');
const tiesScoreElement: HTMLElement = document.querySelector('#game-ties');

/* classes */
class Game {
	private xPlayer: Player;
	private oPlayer: Player;
	private ties: number = 0;

	init = (mode: string, p1Mark: string): void => {
		const p2Mark: string = p1Mark === 'x' ? 'o' : 'x';
		const p1Label: string = mode === 'singleplayer' ? 'you' : 'p1';
		const p2Label: string = mode === 'singleplayer' ? 'cpu' : 'p2';

		if (p1Mark === 'x') {
			this.xPlayer = new Player(p1Label, p1Mark);
			this.oPlayer = new Player(p2Label, p2Mark);
		} else {
			this.xPlayer = new Player(p2Label, p2Mark);
			this.oPlayer = new Player(p1Label, p1Mark);
		}

		initializeScoreBoard(this.xPlayer, this.oPlayer, this.ties);
	};
}

class Player {
	constructor(private name: string, private mark: string, private score: number = 0) {}

	toString = (): string => `${this.mark} (${this.name})`;

	getMark = (): string => this.mark;

	getScore = (): number => this.score;

	updateScore = (): number => ++this.score;
}
/* classes end */

/* game objects */
const ticTacToeGame: Game = new Game();
/* game objects end */

const initializeScoreBoard = (p1: Player, p2: Player, ties: number) => {
	p1NameElement.innerText = p1.toString();
	p1ScoreElement.innerText = p1.getScore().toString();
	p2NameElement.innerText = p2.toString();
	p2ScoreElement.innerText = p2.getScore().toString();
	tiesScoreElement.innerText = ties.toString();
};

/* game menu form handlings */
const isAnyOptionChecked = () => {
	return Array.from(menuFormOptions).some(option => option.checked);
};

const getCheckedOptionMark = (): string => {
	for (const option of menuFormOptions) {
		if (option.checked) return option.dataset.mark;
	}
	return '';
};

const handleMenuSubmitButton = (ev: Event) => {
	ev.preventDefault();
	/* Checks if any mark is selected. If none then displays error */
	if (!isAnyOptionChecked()) {
		menuErrorMsg.classList.add('visible');
		menuErrorMsg.innerText = 'Please select mark for player 1';
		return;
	} else {
		menuErrorMsg.classList.remove('visible');
		menuErrorMsg.innerText = '';
	}

	const submitBtn: HTMLButtonElement = ev.target as HTMLButtonElement;
	const gameMode: string = submitBtn.dataset.mode;
	const p1Mark: string = getCheckedOptionMark();
	gameMenu.classList.add('hidden');
	ticTacToeGameView.classList.remove('hidden');
	ticTacToeGame.init(gameMode, p1Mark);
};
/* game menu form handlings end */

menuFormSubmitButtons.forEach(btn => btn.addEventListener('click', handleMenuSubmitButton));
