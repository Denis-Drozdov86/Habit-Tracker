'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

const page = {
	menu: document.querySelector('.menu__list'),
	head: {
		h1: document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar')
	},
	content: {
		days: document.getElementById('days'),
		habbitDay: document.querySelector('.habbit__day')
	},
	popup: {
		index: document.getElementById('add-habbit-popup'),
		popupForm: document.querySelector('.popup__form input[name="icon"]')
	}
}

function loadData() {
	const strArray = localStorage.getItem(HABBIT_KEY);
	const objArray = JSON.parse(strArray);
	if (Array.isArray(objArray)) {
		habbits = objArray;
	}
}

function saveData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
	if (page.popup.index.classList.contains('cover_hidden')) {
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

function setIcon(context, icon) {
	page.popup.popupForm.value = icon;
	const iconContext = document.querySelector('.icon.icon_active');
	iconContext.classList.remove('icon_active');
	context.classList.add('icon_active');
}

function rerenderMenu(activeHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[active-habbit-id='${habbit.id}']`);
		if (!existed) {
			const element = document.createElement('button');
			element.setAttribute('active-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src='images/${habbit.icon}.svg' alt='${habbit.name}'>`;
			if (habbit.id === activeHabbit.id) {
				element.classList.add('menu__item_active');
			}
			page.menu.appendChild(element);
			continue;
		}
		if (habbit.id === activeHabbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		}
	}
}

function rerenderHead(activeHabbit) {
	page.head.h1.innerText = activeHabbit.name;
	const progress = activeHabbit.days.length / activeHabbit.target > 1 
		? 100 
		: activeHabbit.days.length / activeHabbit.target * 100;
	page.head.progressPercent.innerHTML = progress.toFixed(0) + '%';
	page.head.progressCoverBar.setAttribute('style', `width:${progress}%`);
}

function rerenderContent(activeHabbit) {
	page.content.days.innerHTML = '';
	for (const index in activeHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habbit');
		element.innerHTML = `<div class='habbit__day'>День ${Number(index) + 1}</div>
			<div class='habbit__comment'>${activeHabbit.days[index].comment}<div>
				<button class='habbit__delete' onclick='delDays(${index})'>
					<img src='images/delete.svg' alt='Удалить день ${Number(index) + 1}'>
				</button>`
		page.content.days.appendChild(element);
	}
	page.content.habbitDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function resetForm(form, habbitArray) {
	for (const habbit of habbitArray) {
		form[habbit].value = '';
	}
}

function validatForm(form, habbitArray) {
	const data = new FormData(form);
	const res = {};
	for (const habbit of habbitArray) {
		const formData = data.get(habbit);
		form[habbit].classList.remove('error');
		if (!formData) {
			form[habbit].classList.add('error');
		}
		res[habbit] = formData;
	}
	let isValue = true;
	for (const habbit of habbitArray) {
		if (!res[habbit]) {
			isValue = false;
		}
		if (!isValue) {
			return;
		}
		return res;
	}
}

function addHabbit(event) {
	event.preventDefault();
	const data = validatForm(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	}
	const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
	habbits.push({
		id: maxId + 1,
		name: data.name,
		icon: data.icon,
		target: data.target,
		days: []
	})
	togglePopup();
	resetForm(event.target, ['name', 'target']);
	saveData();
	rerender(maxId + 1);
}

function addDays(event) {
	event.preventDefault();
	const data = validatForm(event.target, ['comment']);
	if (!data) {
		return;
	}

	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: data.comment }])
			}
		}
		return habbit;
	})
	saveData();
	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbitId);
}

function delDays(index) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days
			}
		}
		return habbit;
	})
	rerender(globalActiveHabbitId);
	saveData();
}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;
	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
	if (!activeHabbit) {
		return;
	}
	document.location.replace(document.location.pathname + '#' + activeHabbitId);
	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderContent(activeHabbit);
}

(() => {
	loadData();
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlHabbit = habbits.find(habbit => habbit.id == hashId);
	if (urlHabbit) {
		rerender(urlHabbit.id);
	} else {
		rerender(habbits[0].id);
	}
})();





