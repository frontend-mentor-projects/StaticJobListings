const jobsContainer_el = document.querySelector(".jobs-container");

const filters = new Set();
let jobs = [];
let previousFilteredJobs = [];
let currentFilteredJobs = [];

document.addEventListener("DOMContentLoaded", async () => {
  jobs = await fetchJobs();
  addJobs(jobs);
  addEventListeners();
  currentFilteredJobs = jobs;
});

function addEventListeners() {
  const filters_el = document.querySelector("#filters");

  jobsContainer_el.addEventListener("click", (event) => {
    const target = event.target;

    if (target.matches(".jobs-container-item-tags span")) {
      onTagClicked(target);
    }
  });
  filters_el.addEventListener("click", (event) => {
    const target = event.target;

    if (target.matches(".remove-tag, .remove-tag img")) {
      const removeTag = target.closest(".remove-tag");
      onDeleteTagClicked(removeTag);
    } else if (target.matches(".clear-tags")) {
      onClearTagsClicked();
    }
  });
}

function addJobs(jobs) {
  const fragment = document.createDocumentFragment();

  jobs.forEach((job) => {
    const div = document.createElement("div");
    div.classList.add("jobs-container-item");
    div.setAttribute("data-id", job.id);
    div.innerHTML = `
      <div class="jobs-container-item-logo">
        <img src="${job.logo}" alt="${job.company}">
      </div>
      <div class="jobs-container-item-details">
        <div class="jobs-container-item-details-company">
          <p>${job.company}</p>
          ${job.new ? '<span class="new">New!</span>' : ""}
          ${job.featured ? '<span class="featured">Featured</span>' : ""}
        </div>
        <div class="jobs-container-item-details-position">
          <p>${job.position}</p>
        </div>
        <div class="jobs-container-item-details-info">
          <span>${job.postedAt}</span>
          <span>${job.contract}</span>
          <span>${job.location}</span>
        </div>
      </div>
      <div class="jobs-container-item-tags">
        ${[job.role, job.level, ...job.languages, ...job.tools]
          .map((tag) => `<span>${tag}</span>`)
          .join("")}
      </div>
    `;
    fragment.appendChild(div);
  });

  jobsContainer_el.appendChild(fragment);

}

function removeJobs(jobs) {
  jobs.forEach((job) => {
    const job_el = jobsContainer_el.querySelector(`[data-id="${job.id}"]`);
    if (job_el) {
      job_el.remove();
    }
  });
}

function addFilter(tag) {
  const filters_el = document.querySelector("#filters");
  const filtersContainer_el = document.querySelector(".filters-container");

  html = `
    <div class="filters-container-item">
      <p>${tag}</p>
      <div class="remove-tag">
         <img src="/images/icon-remove.svg" alt=Remove">
      </div>
    </div>
    `;

  filtersContainer_el.insertAdjacentHTML("beforeend", html);
  filters_el.style.display = "flex";
}

function deleteFilter(tag) {
  const parent = tag.parentElement;
  filters.delete(parent.querySelector("p").textContent);
  parent.remove();

  if (filters.size === 0) {
    const filters_el = document.querySelector("#filters");
    filters_el.style.display = "none";
  }
}

function onTagClicked(tag) {
  if (filters.has(tag.textContent)) return;

  filters.add(tag.textContent);
  addFilter(tag.textContent);

  const { jobsToRemove } = filterJobs();
  removeJobs(jobsToRemove);

  if (window.scrollY > 0) {
    window.scrollTo(0, 0);
  }
}

function onDeleteTagClicked(tag) {
  deleteFilter(tag);

  const { jobsToAdd } = filterJobs();

  addJobs(jobsToAdd);
}

function onClearTagsClicked() {
  filters.clear();
  removeJobs(currentFilteredJobs);
  addJobs(jobs);

  const filters_el = document.querySelector("#filters");
  const filtersContainer_el = document.querySelector(".filters-container");
  filtersContainer_el.innerHTML = "";
  filters_el.style.display = "none";
}

function filterJobs() {
  previousFilteredJobs = currentFilteredJobs;
  currentFilteredJobs = [];

  jobs.forEach((job) => {
    const tags = [job.role, job.level, ...job.languages, ...job.tools];
    const hasAllFilters = [...filters].every((filter) => tags.includes(filter));
    if (hasAllFilters) {
      currentFilteredJobs.push(job);
    }
  });

  const previousJobSet = new Set(previousFilteredJobs);
  const currentJobSet = new Set(currentFilteredJobs);

  const jobsToRemove = previousFilteredJobs.filter(
    (job) => !currentJobSet.has(job)
  );
  const jobsToAdd = currentFilteredJobs.filter(
    (job) => !previousJobSet.has(job)
  );

  return { jobsToAdd, jobsToRemove };
}

async function fetchJobs() {
  const response = await fetch("/data.json");
  const data = await response.json();
  return data;
}
