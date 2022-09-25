document.addEventListener("DOMContentLoaded", () => {
  console.log("Loaded");

  const categoriesButtons = document.querySelectorAll(
    "#radio-buttons input[name=caterogies]"
  );
  const typeOfJokeButtons = document.querySelectorAll(
    "#radio-buttons input[name=typeofjoke]"
  );
  const inputSearch = document.querySelector("#input-search");
  const submitButton = document.querySelector("#submit");
  const form = document.querySelector("form");
  const content = document.querySelector(".content");

  const getInitValues = (name) => {
    try {
      return JSON.parse(localStorage.getItem(name)) || [];
    } catch (err) {
      console.error("JSON parse error", err);
    }
  };

  // State
  let state = {
    type: {
      main: "",
      optional: "",
    },
    cardList: [],
    favoriteList: getInitValues("favoriteList"),
  };

  const setState = (statePart = {}) => {
    state = {
      ...state,
      ...statePart,
    };
    renderFavoriteList();
    renderCards();
  };

  const removeActiveClass = (list) => {
    list.forEach((item) => item.classList.remove("active"));
  };

  const toggleFavoriteStatus = (e) => {
    const { dataset: { id } } = e.currentTarget;

    const handleAddItem = (id) => {
      const filteredData = state.cardList.filter((item) => item.id === id);
      setState({
        favoriteList: [...state.favoriteList, ...filteredData],
      });
    };

    const handleRemoveItem = (id) => {
      const filteredData = state.favoriteList.filter((item) => item.id !== id);
      setState({
        favoriteList: filteredData,
      });
    };

    if (state.favoriteList.some((item) => item.id === id)) {
      // check exist in favorite list
      handleRemoveItem(id);
      const tmpSelector = document.querySelector(`[data-id=${id}]`); // have some error
	  tmpSelector && tmpSelector.classList.remove("active")
    } else {
      handleAddItem(id);
	  const tmpSelector = document.querySelector(`[data-id=${id}]`); // have some error
      tmpSelector && tmpSelector.classList.add("active")
      //! e.currentTarget doesn't work, i dont know why
    }
  };

  const updateEventListeners = () => {
    setTimeout(() => {
      const buttonClone = document.querySelectorAll(".buttonClone");
      buttonClone.forEach((button) =>
        button.removeEventListener("click", toggleFavoriteStatus)
      );
      buttonClone.forEach((button) =>
        button.addEventListener("click", toggleFavoriteStatus)
      );
    }, 0);
  };

  const renderSingleCard = (cardData, clone = false) => {
    clone && updateEventListeners();
    return cardData
      .map(
        (item) =>
          `<div class="joke" >
			  <img src="./img/speech-bubble.png" alt="">
			  <div class="joke_content">
				  <p class="joke_header">
					  <span>ID:<a href=""> ${item.id}</a></span>
				  </p>
				  <p class="joke_content_p">${item.value}</p>
				  <div class="joke_foother">
					  <span class="spanLeft">Last update: ${
              item.updated_at
            }</span><span class="spanRight">${item.categories}</span>
				  </div>
			  </div>
			  <svg class="toLike ${clone ? "buttonClone active" : "buttonLikes"}" data-id=${
            item.id
          }
            xmlns="http://www.w3.org/2000/svg" width="30" height="30"  fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16"> <path  fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/> </svg>
	  </div>`
      )
      .join(""); // remove comma separator
  };

  const renderFavoriteList = () => {
    const favoriteList = document.querySelector("#favoritelist");
    favoriteList.innerHTML = renderSingleCard(state.favoriteList, true);

    localStorage.setItem("favoriteList", JSON.stringify(state.favoriteList));
  };

  const handleChangeCategories = (e) => {
    const { value } = e.target;

    categoriesButtons.forEach((button) => {
      const parent = button.closest(".params__type");

      if (button.checked) {
        parent.classList.add("active");
        setState({
          type: {
            optional: "", // clear every time when update main type
            main: value,
          },
        });
        removeActiveClass(typeOfJokeButtons);
      } else {
        parent.classList.remove("active");
      }
    });
  };

  const handleChangeTypes = (e) => {
    const { value } = e.target;

    typeOfJokeButtons.forEach((button) => {
      if (button.checked) {
        button.classList.add("active");
        setState({
          type: {
            ...state.type,
            optional: value,
          },
        });
      } else {
        button.classList.remove("active");
      }
    });
  };

  const handleChangeSearch = (e) => {
    const { value } = e.target;
    setState({
      type: {
        ...state.type,
        optional: value,
      },
    });
  };

  const renderCards = () => {
    content.innerHTML = renderSingleCard(state.cardList);

    setTimeout(() => {
      document
        .querySelectorAll(".buttonLikes")
        .forEach((button) =>
          button.addEventListener("click", toggleFavoriteStatus)
        );
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        type: { main, optional },
      } = state;

      // validation
      // TODO validation length min 3 && max 120
      if ((main === "search" || main === "category") && !optional.trim()) {
        throw new Error("Field is empty");
      }

      let params;
      switch (main) {
        case "random":
          params = `random`;
          break;
        case "category":
          params = `random?category=${optional}`;
          break;
        case "search":
          params = `search?query=${optional}`;
      }

      const response = await fetch(
        `https://api.chucknorris.io/jokes/${params}`
      );
      const result = await response.json();

      if (result.error) {
        throw new Error(result.message);
      }

      const cardsList = result.result ? result.result : [result] || [];
      setState({ cardList: cardsList });
    } catch (error) {
      console.error(error); // add some notify
    }
  };

  //   Radio buttons
  categoriesButtons.forEach((button) =>
    button.addEventListener("change", handleChangeCategories)
  );
  typeOfJokeButtons.forEach((button) => {
    button.addEventListener("change", handleChangeTypes);
  });

  //   Input
  inputSearch.addEventListener("input", handleChangeSearch);

  //   Submit
  submitButton.addEventListener("click", handleSubmit);
  form.addEventListener("submit", handleSubmit);

  //   Init render
  renderFavoriteList();
});
