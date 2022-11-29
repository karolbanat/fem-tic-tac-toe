/* score board elements */
const p1NameElement: HTMLElement = document.querySelector('#p1-game-name');
const p1ScoreElement: HTMLElement = document.querySelector('#p1-game-score');
const p2NameElement: HTMLElement = document.querySelector('#p2-game-name');
const p2ScoreElement: HTMLElement = document.querySelector('#p2-game-score');
const tiesScoreElement: HTMLElement = document.querySelector('#game-ties');

/* classes */
class Game {
	private gameMenu: GameMenu;
	private gameContainer: HTMLElement;
	private xPlayer: Player;
	private oPlayer: Player;
	private ties: number = 0;

	constructor(gameMenuId: string, gameContainerId: string) {
		this.gameMenu = new GameMenu(gameMenuId, this.init);
		this.gameMenu.init();
		this.gameContainer = document.querySelector(gameContainerId);
	}

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

		this.gameContainer.classList.remove('hidden');
		initializeScoreBoard(this.xPlayer, this.oPlayer, this.ties);
	};
}

class GameMenu {
	private gameMenu: HTMLElement;
	private menuForm: HTMLFormElement;
	private formOptions: NodeListOf<HTMLInputElement>;
	private errorMsg: HTMLElement;
	private formSubmitButtons: NodeListOf<HTMLButtonElement>;

	constructor(gameMenuId: string, private gameInit: (mode: string, p1Mark: string) => void) {
		this.gameMenu = document.querySelector(gameMenuId);
		this.menuForm = this.gameMenu.querySelector('form');
		this.formOptions = this.menuForm.querySelectorAll('input[type="radio"]');
		this.errorMsg = this.menuForm.querySelector('[role="alert"]');
		this.formSubmitButtons = this.menuForm.querySelectorAll('button[type="submit"]');
	}

	init = (): void => {
		this.formSubmitButtons.forEach(btn => btn.addEventListener('click', this.handleMenuSubmitButton));
	};

	handleMenuSubmitButton = (ev: Event): void => {
		ev.preventDefault();
		if (!this.isAnyOptionSelected()) {
			this.errorMsg.classList.add('visible');
			this.errorMsg.innerText = 'Please select mark for player 1';
			return;
		} else {
			this.errorMsg.classList.remove('visible');
			this.errorMsg.innerText = '';
		}

		const submitBtn: HTMLButtonElement = ev.target as HTMLButtonElement;
		const gameMode: string = submitBtn.dataset.mode;
		const p1Mark: string = this.getCheckedOptionMark();
		this.gameMenu.classList.add('hidden');
		this.gameInit(gameMode, p1Mark); // method from the parent Game class
	};

	isAnyOptionSelected = (): boolean => {
		return Array.from(this.formOptions).some(option => option.checked);
	};

	getCheckedOptionMark = (): string | null => {
		for (const option of this.formOptions) {
			if (option.checked) return option.dataset.mark;
		}
		return null;
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
const ticTacToeGame: Game = new Game('#game-menu', '#tic-tac-toe-game');
/* game objects end */

const initializeScoreBoard = (p1: Player, p2: Player, ties: number) => {
	p1NameElement.innerText = p1.toString();
	p1ScoreElement.innerText = p1.getScore().toString();
	p2NameElement.innerText = p2.toString();
	p2ScoreElement.innerText = p2.getScore().toString();
	tiesScoreElement.innerText = ties.toString();
};
