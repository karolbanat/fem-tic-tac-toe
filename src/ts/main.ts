/* classes */
/* Game class start */
class Game {
	/* game elements */
	private gameMenu: GameMenu;
	private gameContainer: HTMLElement;
	private gameBoard: GameBoard;
	private scoreBoard: ScoreBoard;
	private turnIndicator: TurnIndicator;
	/* players */
	private xPlayer: Player;
	private oPlayer: Player;
	private playerQueue: [Player, Player];
	/* game states */
	private ties: number = 0;
	private gameCount: number = 0;
	private turnCount: number = 0;

	constructor(gameMenuId: string, gameContainerId: string) {
		this.gameMenu = new GameMenu(gameMenuId, this.init);
		this.gameMenu.init();
		this.gameContainer = document.querySelector(gameContainerId);
		this.scoreBoard = new ScoreBoard('#score-board');
		this.gameBoard = new GameBoard('#game-board', this.onFieldClick, this.getCurrentPlayerMark);
		this.turnIndicator = new TurnIndicator();
	}

	init = (mode: string, p1Mark: string): void => {
		const p2Mark: string = p1Mark === 'x' ? 'o' : 'x';
		let p1Label: string, player1: Player;
		let p2Label: string, player2: Player;

		/* creates labels and players depending on game mode */
		if (mode === 'singleplayer') {
			p1Label = 'you';
			p2Label = 'cpu';
			player2 = new CPUPlayer(p2Label, p2Mark);
		} else {
			p1Label = 'p1';
			p2Label = 'p2';
			player2 = new Player(p2Label, p2Mark);
		}
		player1 = new Player(p1Label, p1Mark);

		/* assigns created players to right spots */
		if (p1Mark === 'x') {
			this.xPlayer = player1;
			this.oPlayer = player2;
		} else {
			this.xPlayer = player2;
			this.oPlayer = player1;
		}

		/* creates tuple of players, to choose current player depending on turn counter */
		this.playerQueue = [this.xPlayer, this.oPlayer];

		/* shows game container */
		this.gameContainer.classList.remove('hidden');

		/* initialize score board with created players */
		this.scoreBoard.init(this.xPlayer, this.oPlayer, this.ties);

		/* initialize game board */
		this.gameBoard.init();

		this.turnIndicator.update(this.getCurrentPlayerMark());

		/* if starting player is CPU then make auto move */
		if (this.getCurrentPlayer() instanceof CPUPlayer) {
			this.makeMove(...(this.getCurrentPlayer() as CPUPlayer).makeMove(this.gameBoard));
		}
	};

	onFieldClick = (ev: Event): void => {
		/* retrieve row and column from clicked button and make move */
		const fieldButton = ev.target as HTMLButtonElement;
		const row: number = parseInt(fieldButton.dataset.row);
		const column: number = parseInt(fieldButton.dataset.column);
		this.makeMove(row, column);
	};

	getCurrentPlayerMark = (): string => {
		return this.getCurrentPlayer().getMark();
	};

	getCurrentPlayer = (): Player => {
		return this.playerQueue[this.turnCount % 2];
	};

	makeMove = (row: number, column: number): void => {
		/* on field click, if field is checked then return doing nothing */
		if (this.gameBoard.isFieldChecked(row, column)) return;

		/* if current player is CPU then make auto move */
		if (this.getCurrentPlayer() instanceof CPUPlayer) {
			[row, column] = (this.getCurrentPlayer() as CPUPlayer).makeMove(this.gameBoard);
		}

		/* checks selected field */
		this.gameBoard.checkField(this.getCurrentPlayer().getMark(), row, column);
		this.increaseTurnCount();
		this.turnIndicator.update(this.getCurrentPlayerMark());

		/* if board is full return before checking if next move should be done by CPU */
		if (this.gameBoard.isFull()) return;

		/* after then field is checked, checks if current player is CPU and if is, then makes a move */
		if (this.getCurrentPlayer() instanceof CPUPlayer) {
			this.makeMove(...(this.getCurrentPlayer() as CPUPlayer).makeMove(this.gameBoard));
		}
	};

	increaseTurnCount = (): number => {
		return ++this.turnCount;
	};
}
/* Game class end */

/* GameMenu class start */
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
		/* shows error if any field wasn't selected */
		if (!this.isAnyOptionSelected()) {
			this.errorMsg.classList.add('visible');
			this.errorMsg.innerText = 'Please select mark for player 1';
			return;
		} else {
			this.errorMsg.classList.remove('visible');
			this.errorMsg.innerText = '';
		}

		/* retrieve game mode from submit button clicked and selected mark from options */
		const submitBtn: HTMLButtonElement = ev.target as HTMLButtonElement;
		const gameMode: string = submitBtn.dataset.mode;
		const p1Mark: string = this.getCheckedOptionMark();

		/* hides game menu */
		this.gameMenu.classList.add('hidden');

		/* and runs game initialization */
		this.gameInit(gameMode, p1Mark); // method from the parent Game class
	};

	isAnyOptionSelected = (): boolean => {
		return Array.from(this.formOptions).some(option => option.checked);
	};

	getCheckedOptionMark = (): string => {
		for (const option of this.formOptions) {
			if (option.checked) return option.dataset.mark;
		}
		return '';
	};
}
/* GameMenu class end */

/* TurnIndicator class start */
class TurnIndicator {
	private currentPlayerMarkElement: HTMLElement;
	private currentPlayerMarkIcon: HTMLImageElement;

	constructor() {
		this.currentPlayerMarkElement = document.querySelector('#current-player-mark');
		this.currentPlayerMarkIcon = document.querySelector('#current-player-mark-icon');
	}

	update = (mark: string) => {
		this.currentPlayerMarkElement.innerText = mark;
		this.currentPlayerMarkIcon.src = `./dist/assets/icon-${mark}.svg`;
	};
}
/* TurnIndicator class end */

/* ScoreBoard class start */
class ScoreBoard {
	private scoreBoardContainer: HTMLElement;
	private p1Label: HTMLElement;
	private p1Score: HTMLElement;
	private p2Label: HTMLElement;
	private p2Score: HTMLElement;
	private tiesScore: HTMLElement;

	constructor(scoreBoardId: string) {
		this.scoreBoardContainer = document.querySelector(scoreBoardId);
		this.p1Label = this.scoreBoardContainer.querySelector('#p1-game-name');
		this.p1Score = this.scoreBoardContainer.querySelector('#p1-game-score');
		this.p2Label = this.scoreBoardContainer.querySelector('#p2-game-name');
		this.p2Score = this.scoreBoardContainer.querySelector('#p2-game-score');
		this.tiesScore = this.scoreBoardContainer.querySelector('#game-ties');
	}

	init = (p1: Player, p2: Player, ties: number = 0): void => {
		this.p1Label.innerText = p1.toString();
		this.p2Label.innerText = p2.toString();
		this.updateScore(p1, p2, ties);
	};

	updateScore = (p1: Player, p2: Player, ties: number): void => {
		this.p1Score.innerText = p1.getScore().toString();
		this.p2Score.innerText = p2.getScore().toString();
		this.tiesScore.innerText = ties.toString();
	};
}
/* ScoreBoard class end */

/* GameBoard class start */
class GameBoard {
	BOARD_SIZE: number = 3;
	private boardElement: HTMLElement;
	private board: Field[][] = [[], [], []];

	constructor(gameBoardId: string, private onFieldClick: (ev: Event) => void, private getCurrentMark: () => string) {
		this.boardElement = document.querySelector(gameBoardId);
	}

	init = (): void => {
		/* gets all board fields */
		const boardFieldElements: NodeListOf<HTMLButtonElement> = this.boardElement.querySelectorAll('.game-board__field');

		/* creating fields */
		for (let row = 0; row < this.board.length; row++) {
			for (let column = 0; column < this.BOARD_SIZE; column++) {
				this.board[row].push(
					new Field(
						row,
						column,
						boardFieldElements[column + row * this.BOARD_SIZE],
						// handles for field(buttons) events
						this.onFieldClick,
						this.getCurrentMark
					)
				);
			}
		}
	};

	/* checks/marks field on passed position */
	checkField = (mark: string, row: number, column: number) => {
		if (row < this.board.length && column < this.board[0].length) {
			this.board[row][column].check(mark);
		}
	};

	isFieldChecked = (row: number, column: number): boolean => {
		return this.board[row][column].isChecked();
	};

	isFull = (): boolean => {
		return this.board.flat().every(field => field.isChecked());
	};
}
/* GameBoard class end */

/* Field class start */
class Field {
	private mark: string = null;

	constructor(
		private row: number,
		private column: number,
		private fieldElement: HTMLButtonElement,
		private gameOnClickHandler: (ev: Event) => void,
		private getCurrentMark: () => string
	) {
		if (this.fieldElement) {
			/* click handling */
			this.fieldElement.addEventListener('click', this.gameOnClickHandler);

			/* hover/focus in handling */
			this.fieldElement.addEventListener('mouseover', this.handleHover);
			this.fieldElement.addEventListener('focusin', this.handleHover);

			/* hover/focus out handling */
			this.fieldElement.addEventListener('mouseout', this.handleBlur);
			this.fieldElement.addEventListener('focusout', this.handleBlur);

			/* setting attributs */
			this.fieldElement.dataset.row = this.row.toString();
			this.fieldElement.dataset.column = this.column.toString();
			this.fieldElement.setAttribute('aria-label', `Row ${this.row + 1}, column ${this.column + 1}, empty field`);

			this.insertImages();
		}
	}

	/* hover/focus in field handle */
	handleHover = (): void => {
		const currentPlayerMark = this.getCurrentMark();
		this.fieldElement.setAttribute('data-current-player', currentPlayerMark);
	};

	/* hover/focus out field handle */
	handleBlur = () => {
		this.fieldElement.removeAttribute('data-current-player');
	};

	insertImages = () => {
		/* O image */
		const oImage = document.createElement('img');
		oImage.setAttribute('src', './dist/assets/icon-o.svg');
		oImage.setAttribute('alt', '');
		oImage.setAttribute('data-name', 'o-icon');

		/* O outline image */
		const oOutlineImage = document.createElement('img');
		oOutlineImage.setAttribute('src', './dist/assets/icon-o-outline.svg');
		oOutlineImage.setAttribute('alt', '');
		oOutlineImage.setAttribute('data-name', 'o-outline-icon');

		/* X image */
		const xImage = document.createElement('img');
		xImage.setAttribute('src', './dist/assets/icon-x.svg');
		xImage.setAttribute('alt', '');
		xImage.setAttribute('data-name', 'x-icon');

		/* X outline image */
		const xOutlineImage = document.createElement('img');
		xOutlineImage.setAttribute('src', './dist/assets/icon-x-outline.svg');
		xOutlineImage.setAttribute('alt', '');
		xOutlineImage.setAttribute('data-name', 'x-outline-icon');

		/* appending created images to the button */
		this.fieldElement.appendChild(oImage);
		this.fieldElement.appendChild(xImage);
		this.fieldElement.appendChild(oOutlineImage);
		this.fieldElement.appendChild(xOutlineImage);
	};

	check = (mark: string): void => {
		this.mark = mark;
		this.fieldElement.setAttribute('aria-label', `Row ${this.row + 1}, column ${this.column + 1}, ${this.mark} mark`);
		this.fieldElement.setAttribute('data-mark', mark);
	};

	isChecked = (): boolean => {
		return this.mark !== null;
	};

	getMark = (): string => {
		return this.mark;
	};
}
/* Field class end */

/* Player class start */
class Player {
	constructor(private name: string, private mark: string, private score: number = 0) {}

	toString = (): string => `${this.mark} (${this.name})`;

	getMark = (): string => this.mark;

	getScore = (): number => this.score;

	updateScore = (): number => ++this.score;
}

class CPUPlayer extends Player {
	makeMove = (board: GameBoard): [number, number] => {
		const boardSize = board.BOARD_SIZE;
		let row, column;
		do {
			row = Math.floor(Math.random() * boardSize);
			column = Math.floor(Math.random() * boardSize);
		} while (board.isFieldChecked(row, column));
		return [row, column];
	};
}
/* Player class end */
/* classes end */

/* game objects */
const ticTacToeGame: Game = new Game('#game-menu', '#tic-tac-toe-game');
/* game objects end */
