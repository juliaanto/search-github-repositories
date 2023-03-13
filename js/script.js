import { Octokit } from "https://cdn.skypack.dev/octokit";

const form = document.forms["search"];

form.onsubmit = async (event) => {
  event.preventDefault();

  const queryString = form.elements.q.value;

  const octokit = new Octokit({});
  const result = await octokit.request("GET /search/repositories", {
    q: queryString,
  });
}