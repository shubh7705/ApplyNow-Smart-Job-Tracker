export default {

  extract() {

    const role =
      document.querySelector("h1")?.innerText;

    const company =
      document.querySelector(".topcard__org-name-link")
        ?.innerText;

    const desc =
      document.querySelector(".description__text")
        ?.innerText;

    return {
      role,
      company,
      description: desc
    };
  }

};
