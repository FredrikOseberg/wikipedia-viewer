import "./css/app.css";

let searchResults = [];
const searchForm = document.querySelector("#searchForm");
const filterForm = document.querySelector("#filterForm");
const searchInput = document.querySelector("#searchBox");
const searchResultsDiv = document.querySelector("#results ");
const searchIcon = document.querySelector('.fa-search');
const filterBox = document.querySelector('#filterBox');
const forms = document.querySelector('.forms');
const suggestions = document.querySelector('.suggestions');
const navBar = document.querySelector('.navbar');
const navSearch = document.querySelector('#navSearch');
const navSaved = document.querySelector('#navSaved');
const searchWrapper = document.querySelector('#main-search');
const savedArticlesDiv = document.querySelector('#savedArticles');

function handleSearchSubmit(e) {
	const filterForm = filterBox.parentNode;
	e.preventDefault();
	forms.classList.add('forms-position-after-search', 'forms-after-search');
	navBar.classList.remove('noDisplay');
	navBar.classList.add('wikiNav');
	filterForm.classList.add('showDiv');
	setTimeout(() => {
		filterBox.classList.add('filterbox-active');
	}, 100);
	filterBox.value = '';
	filterBox.focus();
	const searchTerm = searchInput.value;
	const searchString = `https://en.wikipedia.org//w/api.php?action=query&format=json&prop=extracts%7Cinfo&list=&generator=prefixsearch&exchars=100&exlimit=max&exintro=1&explaintext=1&inprop=url&gpssearch=${searchTerm}&origin=*`;
	search(searchString);
}

function search(searchString) {
	searchResults = [];
	document.body.classList.remove('first-search');
	fetch(searchString)
		.then(blob => blob.json())
		.then(results => {
			// Convert object of objects into array of objects
			for (var key in results.query.pages) {
				searchResults.push(results.query.pages[key]);
			}
		})
		.then(() => setTimeout(() => renderResults(searchResults), 500))
		.catch(() => setTimeout(() => renderResults(searchResults, false), 800));
}



function renderResults(results, data = true) {
	let resultsToRender, articleDropdownOptions, articleSave;
		// Map over objects array and return html
    if (data) {
		resultsToRender = results.map((article, index) => {
		const id = index;
		return `<div class="col-sm-4">
						<div class="article">
							<div class="article-stripe">
								<i class="fa fa-ellipsis-h pull-right" aria-hidden="true"></i>
								<div class="article-dropdown">
									<ul>
										<li class="article-dropdown-save" id="${index}">Save Article</li>
									</ul>
								</div>
							</div>
						<a class="article-info-${index}" href="${article.fullurl}" target="_blank">
							<div class="article-content">
								<h1 class="article-info-${index}">${article.title}</h1>
								<p class="article-info-${index}">${article.extract}</p>
							</div>
						</a>
						</div>
					</div>
					`;			
		}).join('');
    } else {
    	resultsToRender = `<h1 class="search-error">No results found for "${searchBox.value}". Please search again.`;
    	searchBox.value = '';
    	searchBox.focus();
    }


	searchResultsDiv.innerHTML = resultsToRender;
	// Add dropdown event listeners
	articleDropdownOptions = document.querySelectorAll('.fa-ellipsis-h');
	articleSave = document.querySelectorAll('.article-dropdown-save');
	addEventListenersToArticleOptions(articleDropdownOptions, handleArticleOptionsClick);
	addEventListenerToArticleAction(articleSave, handleArticleSaveClick);
}

function handleSearchIconClick(e) {
	this.parentNode.classList.add('noDisplay');
	document.body.classList.remove('first-search');
	searchBox.parentNode.classList.add('showDiv');
	setTimeout(() => {
		searchBox.classList.add('searchbox-active');
	}, 100)
	searchBox.focus();
}

function handleResultsFilter() {
	if (filterBox.value === '') {
		suggestions.classList.remove('showDiv');
	} else {
		suggestions.classList.add('showDiv');
	}
	const filteredSearchTerm = filterResults();
	renderResults(filteredSearchTerm);
}

// filter results and add event listeners to generated list items
function filterResults() {
	let pattern = filterBox.value.replace(/\(/, "\\(");
	pattern = pattern.replace(/\)/, "\\)");
	const wordToMatch = new RegExp(pattern, 'ig');
	const filteredResults = searchResults.filter(item => {
		return item.title.match(wordToMatch);
	});
	const listItems = generateListItems(filteredResults);

	suggestions.innerHTML = listItems;

	const finishedSuggestionItems = document.querySelectorAll('.suggestions li');
	addEventListenerToSuggestionsItems(finishedSuggestionItems);

	return filteredResults;
}

// Add list items to suggestions div
function generateListItems(arrayToGenerateFrom) {
	const listItems = arrayToGenerateFrom.map(listItem => {
		const regex = new RegExp(filterBox.value, 'gi');
		const title = listItem.title.replace(regex, `<span class="highlight">${filterBox.value}</span>`)
		return `<li>${title}</li>`;
	}).join('');

	return listItems;
}

function handleFilterSubmit(e) {
	e.preventDefault();
}

// Suggestion event handlers
function handleSuggestionsClick(e) {
	const listItemText = e.target.textContent;
	filterBox.value = listItemText;
	suggestions.classList.remove('showDiv');
	suggestions.classList.add('noDisplay');
	const filteredSearchTerm = filterResults();
	renderResults(filteredSearchTerm);
}

function addEventListenerToSuggestionsItems(listItems) {
	listItems.forEach(item => {
		item.addEventListener('mouseenter', handleSuggestionMouseenter);
		item.addEventListener('mouseleave', handleSuggestionMouseleave);
	});
}

function handleSuggestionMouseenter() {
	const childrenArray = Array.from(this.children);
	childrenArray.forEach(span => span.classList.remove('highlight'));
}

function handleSuggestionMouseleave() {
	const childrenArray = Array.from(this.children);
	childrenArray.forEach(span => span.classList.add('highlight'));
}

function hideSuggestions() {
	suggestions.classList.remove('showDiv');
	suggestions.classList.add('noDisplay')
}

// Article event handlers

// Add event listener to dynamically created article 
function addEventListenersToArticleOptions(articles, handler) {
	articles.forEach(article => article.addEventListener('click', handler));
}

// Add event listener to dynamically created article options
function addEventListenerToArticleAction(articlesaveButtons, handler) {
	articlesaveButtons.forEach(button => button.addEventListener('click', handler));
}

function handleArticleOptionsClick() {
	const articleDropdown = this.nextElementSibling;
	articleDropdown.children[0].children[0].classList.remove('noDisplay');
	setTimeout(() => articleDropdown.classList.toggle('showDropdown'), 100);
}

function handleSavedArticleOptionsClick() {
	const articleDropdown = this.nextElementSibling;
	setTimeout(() => articleDropdown.classList.toggle('showDropdown'), 100);
}

function handleArticleSaveClick() {
	if (storageAvailable('localStorage')) {
		const id = this.id;
		const articleInfoElements = document.querySelectorAll(`.article-info-${id}`);
		const articleInfo = {
			url: articleInfoElements[0].href,
			title: articleInfoElements[1].textContent,
			extract: articleInfoElements[2].textContent
		};

		localStorage.setItem(articleInfo.title, JSON.stringify(articleInfo));
		flashSuccess(this);
	} else {
		flashError(this);
	}
}

function handleArticleRemoveClick() {
	localStorage.removeItem(this.id);
	flashSuccess(this);
	setTimeout(() => handleNavSavedClick(), 1000);
}

// Add flash message to article
function flashSuccess(object) {
	let li = document.createElement('li');
	object.classList.add('noDisplay');
	li.innerHTML = `<i class="fa fa-check" aria-hidden="true"></i>Success`;
	li.classList.add('success');
	object.parentNode.appendChild(li);
	setTimeout(() => {
		li.classList.add('noDisplay');
		li.parentNode.parentNode.classList.remove('showDropdown');
	}, 3000);
}

function flashError(object) {
	object.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>Could not save`;
	object.classList.add('error');
	setTimeout(() => object.classList.add('noDisplay'), 3000);
}

// Event handlers for navbar buttons
function handleNavSavedClick() {
	let savedArticles = [];
	searchWrapper.classList.add('noDisplay');
	savedArticlesDiv.classList.remove('noDisplay');
	navSearch.classList.remove('active');
	navSaved.classList.add('active');

	for (var item in localStorage) {
		let itemObject = JSON.parse(localStorage.getItem(item));
		savedArticles.push(itemObject);
	}

	if (savedArticles.length > 0) {
		renderSavedArticles(savedArticles);
	} else {
		renderSavedArticles(savedArticles, false);
	}
}

function handleNavSearchClick() {
	searchWrapper.classList.remove('noDisplay');
	savedArticlesDiv.classList.add('noDisplay');
	navSearch.classList.add('active');
	navSaved.classList.remove('active');
}

function renderSavedArticles(savedArticles, data = true) {
	let articlesToRender;
	articlesToRender += '<h1 class="savedArticlesHeader>Your saved articles</h1>"'
	if (data) {
		articlesToRender = savedArticles.map(article => {
					return `<div class="col-sm-4">
							<div class="article">
								<div class="article-stripe">
									<i class="fa fa-ellipsis-h pull-right remove-article-button" aria-hidden="true"></i>
									<div class="article-dropdown">
										<ul>
											<li class="article-dropdown-remove" id="${article.title}">Remove Article</li>
										</ul>
									</div>
								</div>
							<a href="${article.url}" target="_blank">
								<div class="article-content">
									<h1>${article.title}</h1>
									<p>${article.extract}</p>
								</div>
							</a>
							</div>
						</div>
					`;		
		});

		articlesToRender.unshift(`<h1 class="saved-articles-header">Your saved articles</h1>`);
		articlesToRender = articlesToRender.join("");
	} else {
		articlesToRender = `<h1 class="saved-articles-header">You haven't saved any articles yet.</h1>` 
	}

	savedArticlesDiv.innerHTML = articlesToRender;

	// Add event listeners to dynamically creted article items
	if (data) {
		const articles = document.querySelectorAll('.remove-article-button');
		addEventListenersToArticleOptions(articles, handleSavedArticleOptionsClick);
		const removeSavedArticleButton = document.querySelectorAll('.article-dropdown-remove');
		addEventListenerToArticleAction(removeSavedArticleButton, handleArticleRemoveClick);
	}

}

// Function to see if localstorage is available

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

// Event Listeners
searchForm.addEventListener('submit', handleSearchSubmit);
searchIcon.addEventListener('click', handleSearchIconClick);
filterBox.addEventListener('keyup', handleResultsFilter);
filterBox.addEventListener('change', handleResultsFilter);
filterForm.addEventListener('submit', handleFilterSubmit);
suggestions.addEventListener('click', handleSuggestionsClick);
suggestions.addEventListener('mouseenter', (e) => document.activeElement.blur());
window.addEventListener('click', hideSuggestions);
navSaved.addEventListener('click', handleNavSavedClick);
navSearch.addEventListener('click', handleNavSearchClick);






