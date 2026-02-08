export default {

  extract() {

    const role =
      document.querySelector("h1")?.innerText;

    const company =
      document.querySelector(
        "[data-testid=inlineHeader-companyName]"
      )?.innerText;

    const desc =
      document.querySelector("#jobDescriptionText")
        ?.innerText;

    return {
      role,
      company,
      description: desc
    };
  }

};
