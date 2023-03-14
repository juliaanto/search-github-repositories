import { Octokit } from "https://cdn.skypack.dev/octokit";

const form = document.forms["search"];
const repositoriesElement = document.querySelector('.repositories');
const loader = document.querySelector('.loader');

form.onsubmit = async (event) => {
  event.preventDefault();

  loader.hidden = false;
  repositoriesElement.innerHTML = '';
  
  const queryString = form.elements.q.value;

  const octokit = new Octokit({});
  const result = await octokit.request("GET /search/repositories", {
    q: queryString,
  });

  if (result.status === 200) {
    loader.hidden = true;
  }
  
  const repositories = result.data.items.slice(0, 10);

  for (const repository of repositories) {
    repositoriesElement.insertAdjacentHTML("beforeend", `
      <div class="repository">
        <a class="repository__link" href="${repository.html_url}" target="_blank">${repository.owner.login}/<em class="repository__name">${repository.name}</em></a>
      </div>
    `)
  }
}