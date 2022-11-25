const gameMenu: HTMLElement = document.querySelector('#game-menu');
/* form elements */
const gameMenuForm: HTMLFormElement = gameMenu.querySelector('.game-menu-form');
const menuFormOptions: NodeListOf<HTMLInputElement> = gameMenuForm.querySelectorAll('input[type="radio"]');
const menuErrorMsg: HTMLElement = gameMenuForm.querySelector('[role="alert"]');
const menuFormSubmitButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('button[type="submit"]');
/* game view: container with header, game board and scores */
const ticTacToeGameView: HTMLElement = document.querySelector('#tic-tac-toe-game');

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

	// const submitBtn: HTMLButtonElement = ev.target as HTMLButtonElement;
	// const gameMode: string = submitBtn.dataset.mode;
	// const p1Mark: string = getCheckedOptionMark();
	gameMenu.classList.add('hidden');
	ticTacToeGameView.classList.remove('hidden');
};

menuFormSubmitButtons.forEach(btn => btn.addEventListener('click', handleMenuSubmitButton));
