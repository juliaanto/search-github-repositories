import { Octokit } from "https://cdn.skypack.dev/octokit";

const octokit = new Octokit({});
const form = document.forms["search"];
const submitButton = form.querySelector('.search__button');
const repositoriesElement = document.querySelector('.repositories');
const loader = document.querySelector('.loader');

form.onsubmit = async (event) => {
  event.preventDefault();
  const queryString = form.elements.q.value;
  const isSearchQueryValid = validateSearchInput(queryString);

  if (isSearchQueryValid) {
    loader.hidden = false;
    submitButton.disabled = true;
    repositoriesElement.innerHTML = '';
    await sendRequest(queryString);
  }
}

async function sendRequest(queryString) {
  try {
    const result = await octokit.request("GET /search/repositories", {
      q: queryString,
    });
    loader.hidden = true;
    submitButton.disabled = false;
    const repositories = result.data.items.slice(0, 10);
    showRepositories(repositories);
  } catch (error) {
    loader.hidden = true;
    submitButton.disabled = false;
    handleError(error.status);
  }
}

function showRepositories(repositories) {
  if (repositories.length === 0) {
    repositoriesElement.insertAdjacentHTML('beforeend', `
        <p>Ничего не найдено</p>
      `)
  } else {
    for (const repository of repositories) {
      repositoriesElement.insertAdjacentHTML('beforeend', `
        <div class="repository">
          <div class="repository__full-name">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>
            <a class="repository__link" href="${repository.html_url}" target="_blank">${repository.owner.login}/<em class="repository__name">${repository.name}</em></a>
          </div>
          <div class="repository__wrapper">
            ${repository.description ? `
              <p class="repository__description">${repository.description?.length < 117 ? repository.description : repository.description.substr(0, 117) + '...'}</p>
            ` : ''}
            ${repository.topics.length > 0 ? showTopics(repository.topics) : ''}
            <div class="repository__extra">
              ${repository.stargazers_count > 0 ? `
                <div class="repository__stargazers">
                  <svg role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
                  </svg>
                  <p class="repository__extra-text">${getStargazersCount(repository.stargazers_count)}</p>
                </div>
                ` : ''}
              ${repository.language ? `<p class="repository__extra-text">${repository.language}</p>` : ''}
              ${repository.license ? `<p class="repository__extra-text">${repository.license.spdx_id} license</p>` : ''}
              <p class="repository__extra-text">${getDate(repository.pushed_at)}</p>
            </div>
          </div>
        </div>
      `)
    }
  }
}

function showTopics(topics) {
  let topicItems = '';
  
  for (const topic of topics) {
    topicItems += `<li class="repository__topic">${topic}</li>`;
  }
  
  return `<ul class="repository__topics">${topicItems}</ul>`;
}

function getDate(currentDate) {
  let result;
  
  const date = new Date(currentDate);
  const now = new Date();
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const intervalInMinutes = (now - date) / (1000 * 60);
  const intervalInHours = intervalInMinutes / 60;
  const intervalInDays = intervalInHours / 24;
  const intervalInWeeks = intervalInDays / 7;
  const intervalInMonths = intervalInDays / 30;

  if (intervalInMinutes < 1) {
    result = 'Updated now';
  } else if (intervalInMinutes < 2) {
    result = 'Updated 1 minute ago';
  } else if (intervalInMinutes < 60) {
    result = `Updated ${Math.floor(intervalInMinutes)} minutes ago`;
  } else if (intervalInHours < 2) {
    result = 'Updated 1 hour ago';
  } else if (intervalInHours < 24) {
    result = `Updated ${Math.floor(intervalInHours)} hours ago`;
  } else if (intervalInDays < 2) {
    result = 'Updated yesterday';
  } else if (intervalInDays < 6) {
    result = `Updated ${Math.ceil(intervalInDays)} days ago`;
  } else if (intervalInWeeks < 2) {
    result = 'Updated last week';
  } else if (intervalInWeeks < 3) {
    result = `Updated ${Math.ceil(intervalInWeeks)} weeks ago`;
  } else if (intervalInMonths < 1) {
    result = 'Updated last month';
  } else if (date.getFullYear() === now.getFullYear()) {
    result = `Updated on ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  } else {
    result = `Updated on ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  return result;
}

function getStargazersCount(number) {
  if (number > 1000) {
    return `${(number / 1000).toFixed(1)}k`;
  } else {
    return number;
  }
}

function handleError(statusCode) {
  const httpResponseStatus = {
    'OK': 200,
    'Validation failed': 422,
    'Service unavailable': 503,
  }

  switch (statusCode) {
      case httpResponseStatus['Validation failed']:
        showMessage('Некорректный поисковой запрос. Попробуйте еще раз.')
        break;
      case httpResponseStatus['Service unavailable']:
        showMessage('Сервис временно недоступен')
        break;
      default:
        showMessage('Произошла ошибка. Попробуйте еще раз.');
    }
}

function showMessage(text) {
  repositoriesElement.insertAdjacentHTML('beforeend', `
    <p>${text}</>
  `)
}

function validateSearchInput(text) {
  let isValid = false;
  
  if (text.trim().length === 0) {
    showInvalidInputMessage('Задан пустой поисковый запрос');
  } else if (text.length > 256) {
    showInvalidInputMessage('Превышено максимальное количество символов (256)');
  } else {
    isValid = true;
  }

  return isValid;
}

function showInvalidInputMessage(message) {
  const searchField = form.querySelector('.search__field');
  const inputElement = searchField.querySelector('.search__input');
  
  inputElement.classList.add('search__input_invalid');

  if (!searchField.querySelector('.search-field__message')) {
    searchField.insertAdjacentHTML('beforeend', `
    <p class="search-field__message">${message}</p>
  `)
  }

  inputElement.oninput = () => {
    if (inputElement.classList.contains('search__input_invalid')) {
      inputElement.classList.remove('search__input_invalid');
      searchField.querySelector('.search-field__message').remove();
    }
  }
}
