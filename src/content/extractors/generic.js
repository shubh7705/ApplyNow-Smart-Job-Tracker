export default {

  extract() {

    const role =
      document.querySelector("h1,h2")?.innerText;

    const desc =
      document.body.innerText.slice(0, 3000);

    return {
      role,
      company: "Unknown",
      description: desc
    };
  }

};
