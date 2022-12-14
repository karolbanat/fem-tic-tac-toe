/* types */
type TripleField = [Field, Field, Field];
type Coordinates = [number, number];
/* types end */

/* classes */
/* Game class start */
class Game {
	/* game elements */
	private gameMenu: GameMenu;
	private gameContainer: HTMLElement;
	private gameBoard: GameBoard;
	private scoreBoard: ScoreBoard;
	private turnIndicator: TurnIndicator;
	private restartGameButton: HTMLButtonElement;
	/* game modals */
	private gameResultModal: ResultModal;
	private restartGameModal: RestartModal;
	/* players */
	private xPlayer: Player;
	private oPlayer: Player;
	private playerQueue: [Player, Player];
	/* game states */
	private ties: number = 0;
	private gameCount: number = 0;
	private turnCount: number = 0;

	constructor() {
		/* game menu */
		this.gameMenu = new GameMenu('#game-menu', this.init);
		this.gameMenu.init();

		/* container */
		this.gameContainer = document.querySelector('#tic-tac-toe-game');

		/* game board */
		this.gameBoard = new GameBoard('#game-board', this.onFieldClick, this.getCurrentPlayerMark);

		/* score board and current's player turn */
		this.scoreBoard = new ScoreBoard('#score-board');
		this.turnIndicator = new TurnIndicator();

		/* restart button */
		this.restartGameButton = this.gameContainer.querySelector('#restart-game-button');
		this.restartGameButton.addEventListener('click', this.onRestartButtonClick);

		/* modals */
		this.gameResultModal = new ResultModal(this.onGameQuit, this.onGameContinue);
		this.restartGameModal = new RestartModal(this.restartGame, this.setResetButtonFocus);
	}

	/* handlers */
	onFieldClick = (ev: Event): void => {
		/* retrieve row and column from clicked button and make move */
		const fieldButton = ev.target as HTMLButtonElement;
		const row: number = parseInt(fieldButton.dataset.row);
		const column: number = parseInt(fieldButton.dataset.column);
		this.makeMove(row, column);
	};

	onGameContinue = (): void => {
		this.gameCount++;
		this.turnCount = 0;
		this.gameBoard.clear();
		this.setResetButtonFocus();
		this.updateScoreBoard();
		this.makeMoveCPU();
	};

	onGameQuit = (): void => {
		this.gameContainer.classList.add('hidden');
		this.gameBoard.clear();
		this.gameMenu.show();
		this.gameMenu.setFocus();
	};

	onRestartButtonClick = (): void => {
		this.restartGameModal.show();
	};

	setResetButtonFocus = (): void => {
		this.restartGameButton.focus();
	};
	/* handlers end */

	/* game management */
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
		this.resetCounters();

		/* shows game container */
		this.gameContainer.classList.remove('hidden');

		this.startGame();
	};

	startGame = (): void => {
		/* initialize score board with created players */
		this.scoreBoard.init(this.xPlayer, this.oPlayer, this.ties);

		/* initialize game board */
		this.gameBoard.init();

		this.updateTurnIndicator();

		/* if starting player is CPU then make auto move */
		this.makeMoveCPU();
	};

	restartGame = (): void => {
		/* reset counters */
		this.resetCounters();

		/* reset board */
		this.gameBoard.clear();

		/* reset players */
		this.xPlayer.resetScore();
		this.oPlayer.resetScore();

		/* update score board */
		this.updateScoreBoard();
		this.updateTurnIndicator();

		/* to make move if first player is CPU */
		this.makeMoveCPU();

		/* set focus to restart button */
		this.setResetButtonFocus();
	};
	/* game management end */

	/* making move related */
	makeMove = (row: number, column: number): void => {
		/* on field click, if field is checked then return doing nothing */
		if (this.gameBoard.isFieldChecked(row, column)) return;

		/* checks selected field */
		this.gameBoard.checkField(this.getCurrentPlayer().getMark(), row, column);
		this.afterMove();
	};

	afterMove = (): void => {
		const winningFields = this.gameBoard.getWinningFields();
		if (winningFields !== null) {
			this.gameResultModal.show(this.getCurrentPlayer());
			this.getCurrentPlayer().updateScore();
			return;
		}

		if (this.gameBoard.isFull()) {
			this.gameResultModal.show();
			this.ties++;
			return;
		}

		this.increaseTurnCount();
		this.updateTurnIndicator();

		this.makeMoveCPU();
	};

	makeMoveCPU = (): void => {
		/* after field is checked, checks if current player is CPU and if is, then makes a move */
		if (this.getCurrentPlayer() instanceof CPUPlayer) {
			this.makeMove(...(this.getCurrentPlayer() as CPUPlayer).makeMove(this.gameBoard));
		}
	};
	/* making move related end */

	/* player states */
	getCurrentPlayerMark = (): string => {
		return this.getCurrentPlayer().getMark();
	};

	getCurrentPlayer = (): Player => {
		return this.playerQueue[(this.gameCount + this.turnCount) % 2];
	};
	/* player states end */

	/* counters management */
	resetCounters = (): void => {
		this.ties = 0;
		this.turnCount = 0;
		this.gameCount = 0;
	};

	increaseTurnCount = (): number => {
		return ++this.turnCount;
	};
	/* counters management end */

	/* view updates */
	updateTurnIndicator = (): void => {
		this.turnIndicator.update(this.getCurrentPlayerMark());
	};

	updateScoreBoard = (): void => {
		this.scoreBoard.updateScore(this.xPlayer, this.oPlayer, this.ties);
	};
	/* view updates end */
}
/* Game class end */

/* Player class start */
class Player {
	constructor(private name: string, private mark: string, private score: number = 0) {}

	toString = (): string => `${this.mark} (${this.name})`;

	getName = (): string => this.name;

	getMark = (): string => this.mark;

	getScore = (): number => this.score;

	updateScore = (): number => ++this.score;

	resetScore = (): void => {
		this.score = 0;
	};
}

class CPUPlayer extends Player {
	makeMove = (board: GameBoard): Coordinates => {
		const winningPlay: Coordinates = this.getWinningPlay(board);
		if (winningPlay !== null) return winningPlay;

		const blockingPlay: Coordinates = this.getBlockingPlay(board);
		if (blockingPlay !== null) return blockingPlay;

		return this.makeRandomMove(board);
	};

	getWinningPlay = (board: GameBoard): Coordinates | null => {
		return this.getPlay(board, this.getMark());
	};

	getBlockingPlay = (board: GameBoard): Coordinates | null => {
		const compareToMark = this.getMark() === 'o' ? 'x' : 'o';
		return this.getPlay(board, compareToMark);
	};

	getPlay = (board: GameBoard, compareToMark: string): Coordinates | null => {
		const boardSize: number = board.BOARD_SIZE;
		/* check rows and columns */
		for (let rowNumber = 0; rowNumber < boardSize; rowNumber++) {
			const fieldsRow: TripleField = board.getRow(rowNumber);
			let sameMarkCount: number = 0;
			let emptyFieldCount: number = 0;
			let emptyField: Field;
			for (const field of fieldsRow) {
				if (field.getMark() === compareToMark) sameMarkCount++;
				if (field.getMark() === null) {
					emptyFieldCount++;
					emptyField = field;
				}
			}

			/*  if there are two mark in checked line and empty field,
                then return coordinates of empty field */
			if (sameMarkCount === 2 && emptyFieldCount === 1) {
				return [emptyField.getRow(), emptyField.getColumn()];
			}
		}

		/* check columns */
		for (let colNumber = 0; colNumber < boardSize; colNumber++) {
			const fieldsColumn: TripleField = board.getColumn(colNumber);
			let sameMarkCount: number = 0;
			let emptyFieldCount: number = 0;
			let emptyField: Field;
			for (const field of fieldsColumn) {
				if (field.getMark() === compareToMark) sameMarkCount++;
				if (field.getMark() === null) {
					emptyFieldCount++;
					emptyField = field;
				}
			}

			/*  if there are two mark in checked line and empty field,
                then return coordinates of empty field */
			if (sameMarkCount === 2 && emptyFieldCount === 1) {
				return [emptyField.getRow(), emptyField.getColumn()];
			}
		}

		/* check diagonals */
		// left top to bottom right
		const leftTopDiagonal: TripleField = board.getLeftTopDiagonal();
		let sameMarkCount: number = 0;
		let emptyFieldCount: number = 0;
		let emptyField: Field;
		for (const field of leftTopDiagonal) {
			if (field.getMark() === compareToMark) sameMarkCount++;
			if (field.getMark() === null) {
				emptyFieldCount++;
				emptyField = field;
			}
		}

		/*  if there are two mark in checked line and empty field,
            then return coordinates of empty field */
		if (sameMarkCount === 2 && emptyFieldCount === 1) {
			return [emptyField.getRow(), emptyField.getColumn()];
		}

		// right top to bottom left
		const rightTopDiagonal: TripleField = board.getRightTopDiagonal();
		sameMarkCount = 0;
		emptyFieldCount = 0;
		emptyField = null;
		for (const field of rightTopDiagonal) {
			if (field.getMark() === compareToMark) sameMarkCount++;
			if (field.getMark() === null) {
				emptyFieldCount++;
				emptyField = field;
			}
		}

		/*  if there are two mark in checked line and empty field,
            then return coordinates of empty field */
		if (sameMarkCount === 2 && emptyFieldCount === 1) {
			return [emptyField.getRow(), emptyField.getColumn()];
		}

		return null;
	};

	makeRandomMove = (board: GameBoard): Coordinates => {
		const boardSize: number = board.BOARD_SIZE;
		let row: number, column: number;
		do {
			row = Math.floor(Math.random() * boardSize);
			column = Math.floor(Math.random() * boardSize);
		} while (board.isFieldChecked(row, column));
		return [row, column];
	};
}
/* Player class end */

/* GameBoard class start */
class GameBoard {
	BOARD_SIZE: number = 3;
	private boardElement: HTMLElement;
	private board: Field[][];

	constructor(gameBoardId: string, private onFieldClick: (ev: Event) => void, private getCurrentMark: () => string) {
		this.boardElement = document.querySelector(gameBoardId);
	}

	/* management */
	init = (): void => {
		this.board = [[], [], []];
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

	clear = (): void => {
		for (let row = 0; row < this.board.length; row++) {
			for (let column = 0; column < this.BOARD_SIZE; column++) {
				this.board[row][column].clear();
			}
		}
	};
	/* management end */

	/* checking state */
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
	/* checking state end */

	/* winning fields search */
	getWinningFields = (): TripleField | null => {
		return this.checkRows() || this.checkColumns() || this.checkDiagonal();
	};

	checkRows = (): TripleField | null => {
		for (let row = 0; row < this.BOARD_SIZE; row++) {
			if (
				this.board[row][0].getMark() !== null &&
				this.board[row][0].getMark() === this.board[row][1].getMark() &&
				this.board[row][1].getMark() === this.board[row][2].getMark()
			)
				return [
					this.board[row][0].setAsGameWinning(),
					this.board[row][1].setAsGameWinning(),
					this.board[row][2].setAsGameWinning(),
				];
		}
		return null;
	};

	checkColumns = (): TripleField | null => {
		for (let column = 0; column < this.BOARD_SIZE; column++) {
			if (
				this.board[0][column].getMark() !== null &&
				this.board[0][column].getMark() === this.board[1][column].getMark() &&
				this.board[1][column].getMark() === this.board[2][column].getMark()
			)
				return [
					this.board[0][column].setAsGameWinning(),
					this.board[1][column].setAsGameWinning(),
					this.board[2][column].setAsGameWinning(),
				];
		}
		return null;
	};

	checkDiagonal = (): TripleField | null => {
		/* top left, middle, and bottom right */
		if (
			this.board[1][1].getMark() !== null &&
			this.board[0][0].getMark() === this.board[1][1].getMark() &&
			this.board[1][1].getMark() === this.board[2][2].getMark()
		)
			return [
				this.board[0][0].setAsGameWinning(),
				this.board[1][1].setAsGameWinning(),
				this.board[2][2].setAsGameWinning(),
			];

		/* top right, middle, and bottom left */
		if (
			this.board[1][1].getMark() !== null &&
			this.board[0][2].getMark() === this.board[1][1].getMark() &&
			this.board[1][1].getMark() === this.board[2][0].getMark()
		)
			return [
				this.board[0][2].setAsGameWinning(),
				this.board[1][1].setAsGameWinning(),
				this.board[2][0].setAsGameWinning(),
			];

		/* no fields matched */
		return null;
	};
	/* winning fields search end */

	/* accessors */
	getRow = (rowNumber: number): TripleField => {
		return [this.board[rowNumber][0], this.board[rowNumber][1], this.board[rowNumber][2]];
	};

	getColumn = (columnNumber: number): TripleField => {
		return [this.board[0][columnNumber], this.board[1][columnNumber], this.board[2][columnNumber]];
	};

	getLeftTopDiagonal = (): TripleField => {
		return [this.board[0][0], this.board[1][1], this.board[2][2]];
	};

	getRightTopDiagonal = (): TripleField => {
		return [this.board[0][2], this.board[1][1], this.board[2][0]];
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

			/* setting attributes */
			this.fieldElement.dataset.row = this.row.toString();
			this.fieldElement.dataset.column = this.column.toString();
			this.clear();
		}
	}

	/* handlers */
	/* hover/focus in field handle */
	handleHover = (): void => {
		const currentPlayerMark = this.getCurrentMark();
		this.fieldElement.setAttribute('data-current-player', currentPlayerMark);
	};

	/* hover/focus out field handle */
	handleBlur = (): void => {
		this.fieldElement.removeAttribute('data-current-player');
	};
	/* handlers end */

	/* management */
	clear = (): void => {
		this.mark = null;
		this.fieldElement.setAttribute('aria-label', `Row ${this.row + 1}, column ${this.column + 1}, empty field`);
		this.fieldElement.removeAttribute('data-game-winning');
		this.fieldElement.removeAttribute('data-current-player');
		this.fieldElement.removeAttribute('data-mark');
	};

	check = (mark: string): void => {
		this.mark = mark;
		this.fieldElement.setAttribute('aria-label', `Row ${this.row + 1}, column ${this.column + 1}, ${this.mark} mark`);
		this.fieldElement.setAttribute('data-mark', mark);
	};
	/* management end */

	/* helpers */
	isChecked = (): boolean => {
		return this.mark !== null;
	};

	setAsGameWinning = (): Field => {
		this.fieldElement.setAttribute('data-game-winning', '');
		return this;
	};
	/* helpers end */

	/* getters */
	getMark = (): string | null => {
		return this.mark;
	};

	getRow = (): number => this.row;

	getColumn = (): number => this.column;
}
/* Field class end */

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

	/* handlers */
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
		this.hide();

		/* and runs game initialization */
		this.gameInit(gameMode, p1Mark); // method from the parent Game class
	};
	/* handlers end */
	isAnyOptionSelected = (): boolean => {
		return Array.from(this.formOptions).some(option => option.checked);
	};

	getCheckedOptionMark = (): string => {
		for (const option of this.formOptions) {
			if (option.checked) return option.dataset.mark;
		}
		return '';
	};
	/* helpers */

	/* view update */
	show = (): void => {
		this.gameMenu.classList.remove('hidden');
	};

	hide = (): void => {
		this.gameMenu.classList.add('hidden');
	};
	/* view update end */

	/* other */
	setFocus = (): void => {
		this.formOptions[0]?.focus();
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

/* ResultModal class start */
class ResultModal {
	private modal: HTMLElement;
	private modalMessage: HTMLParagraphElement;
	private modalHeading: HTMLHeadingElement;
	private quitButton: HTMLButtonElement;
	private continueButton: HTMLButtonElement;

	constructor(private gameQuitHandling: () => void, private gameContinueHandling: () => void) {
		this.modal = document.querySelector('#game-result-modal');
		this.modalMessage = this.modal.querySelector('.modal__message');
		this.modalHeading = this.modal.querySelector('.modal__heading');

		/* quit button */
		this.quitButton = this.modal.querySelector('button[data-action="quit"]');
		this.quitButton.addEventListener('click', this.handleQuit);

		/* continue button */
		this.continueButton = this.modal.querySelector('button[data-action="continue"]');
		this.continueButton.addEventListener('click', this.handleContinue);
	}

	/* handlers */
	handleContinue = (): void => {
		this.gameContinueHandling();
		this.hide();
	};

	handleQuit = (): void => {
		this.hide();
		this.gameQuitHandling();
	};
	/* handlers end */

	/* view updates */
	show = (winner: Player | null = null): void => {
		this.modal.classList.add('active');
		this.updateResult(winner);
	};

	hide = (): void => {
		this.modal.classList.remove('active');
	};

	updateResult = (winner: Player | null): void => {
		if (winner === null) this.displayTieResult();
		else this.displayWinnerResult(winner);

		this.quitButton.focus();
	};

	displayTieResult = (): void => {
		this.modal.setAttribute('data-winner', 'tie');
		this.modalHeading.innerHTML = '';
		this.modalHeading.innerText = 'Round tied';
	};

	displayWinnerResult = (winner: Player): void => {
		this.modal.setAttribute('data-winner', winner.getMark());

		const message = this.getRoundMessage(winner.getName());
		this.modalMessage.innerText = message;
		this.setResultHeading(winner);
	};

	setResultHeading = (winner: Player): void => {
		/* clear heading before setting message */
		this.modalHeading.innerHTML = '';
		const mark = winner.getMark();

		/* winning mark icon */
		const imgElement = document.createElement('img');
		imgElement.setAttribute('src', `./dist/assets/icon-${mark}.svg`);
		imgElement.setAttribute('alt', '');

		/* hidden mark for screen readers */
		const hiddenMark = document.createElement('span');
		hiddenMark.classList.add('visually-hidden');
		hiddenMark.innerText = mark;

		/* message after image */
		const messageText = document.createTextNode('takes the round');

		/* span container for hidden mark and message text */
		const headingSpan = document.createElement('span');
		headingSpan.appendChild(hiddenMark);
		headingSpan.appendChild(messageText);

		this.modalHeading.appendChild(imgElement);
		this.modalHeading.appendChild(headingSpan);
	};
	/* view updates end */

	/* helpers */
	getRoundMessage = (playerName: string): string => {
		let message;
		switch (playerName) {
			case 'p1':
				message = 'Player 1 wins!';
				break;
			case 'p2':
				message = 'Player 2 wins!';
				break;
			case 'you':
				message = 'You won!';
				break;
			case 'cpu':
				message = 'Oh no, you lost...';
				break;
			default:
				message = '';
		}
		return message;
	};
}
/* ResultModal class end */

/* RestartModal class start */
class RestartModal {
	private modal: HTMLElement;
	private cancelButton: HTMLButtonElement;
	private restartButton: HTMLButtonElement;

	constructor(private gameRestartHandling: () => void, private cancelSupport: () => void) {
		this.modal = document.querySelector('#game-reset-modal');

		/* cancel button */
		this.cancelButton = this.modal.querySelector('button[data-action="cancel"]');
		this.cancelButton.addEventListener('click', this.handleCancel);

		/* restart button */
		this.restartButton = this.modal.querySelector('button[data-action="restart"]');
		this.restartButton.addEventListener('click', this.handleRestart);
	}

	/* handlers */
	handleCancel = (): void => {
		this.hide();
		this.cancelSupport();
	};

	handleRestart = (): void => {
		this.gameRestartHandling();
		this.hide();
	};
	/* handlers end */

	/* view updates */
	show = (): void => {
		this.modal.classList.add('active');
		this.cancelButton.focus();
	};

	hide = (): void => {
		this.modal.classList.remove('active');
	};
	/* view updates end */
}
/* RestartModal class start */
/* classes end */

/* game objects */
const ticTacToeGame: Game = new Game();
/* game objects end */
