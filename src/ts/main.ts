const gameMenu: HTMLElement = document.querySelector('#game-menu');
const gameMenuForm: HTMLFormElement = gameMenu.querySelector('.game-menu-form');
const menuFormOptions: NodeListOf<HTMLInputElement> = gameMenuForm.querySelectorAll('input[type="radio"]');
const menuFormSubmitButtons: NodeListOf<HTMLButtonElement> = document.querySelectorAll('button[type="submit"]');
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
	if (!isAnyOptionChecked()) return;

	// const submitBtn: HTMLButtonElement = ev.target as HTMLButtonElement;
	// const gameMode: string = submitBtn.dataset.mode;
	// const p1Mark: string = getCheckedOptionMark();
	gameMenu.classList.add('hidden');
	ticTacToeGameView.classList.remove('hidden');
};

menuFormSubmitButtons.forEach(btn => btn.addEventListener('click', handleMenuSubmitButton));
