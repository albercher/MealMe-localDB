const formSearch = document.querySelector("#search-form");
const randomSearch = document.querySelector("#random-button");
const star1 = document.querySelector(".star-1");
const alertMsg = document.getElementById("alert");
const mealName = document.querySelector("#meal-name");
const mealImg = document.querySelector("#meal-image");
const instruct = document.querySelector("#instructions");

const baseurl = "https://www.themealdb.com/api/json/v1/1/";
const baseurlLocal = "http://localhost:3000/favorites/";


/* FUNCTIONS */

// get a random number with the max being length of array
function randomNumber(max) {
    return Math.floor(Math.random() * max)
}

// function to toggle star fill and color
function starToggle(){
    this.classList.toggle("bi-star");
    this.classList.toggle("bi-star-fill");
    this.classList.toggle("text-warning");
}

function activate(){
    star1.addEventListener("click", addFavorite);
    
    // add and remove class when hover over star to fill yellow
    star1.addEventListener("mouseover", starToggle);

    // add and remove class when leaving star to return to original state
    star1.addEventListener("mouseout", starToggle);

    // remove event listener that makes it blink
    star1.removeEventListener("click", activate);

    // if clicked, it will no longer blink
    star1.addEventListener("click", deactivate);

    star1.removeEventListener("click", deleteFavorite);

}


function deactivate(){
    star1.removeEventListener("click", addFavorite);
    star1.addEventListener("click", deleteFavorite);
    
    // add and remove class when hover over star to fill yellow
    star1.removeEventListener("mouseover", starToggle);

    // add and remove class when leaving star to return to original state
    star1.removeEventListener("mouseout", starToggle);

    // remove event listener that makes it not blink
    star1.removeEventListener("click", deactivate);

    // if clicked, it will blink
    star1.addEventListener("click", activate);
}


function fetchFavorites(){      
    let dropdownList = document.querySelector("#fave-dropdown");    
    dropdownList.replaceChildren();
fetch(baseurlLocal)
.then(response => response.json())
.then(data => data.forEach((element) => {
    let newFaveLi = document.createElement("li");



    newFaveLi.classList.add("dropdown-item")
    newFaveLi.innerHTML = element.strMeal;
    dropdownList.append(newFaveLi);
    newFaveLi.addEventListener("click", () => {
      fetch(`${baseurl}lookup.php?i=${element.idMeal}`)
      .then(response => response.json())
      .then(data => {
          recipeDisplay(data.meals[0])          
          star1.classList.add("bi-star-fill", "text-warning");
        star1.classList.remove("bi-star");
        deactivate();
      });

      star1.classList.add("favorite");

      })

    
})
  
  
);    
};

fetchFavorites();

function addFavorite(){

  star1.classList.add("favorite");
  let mealNameInner = document.querySelector("#meal-name").innerHTML;

  let data = {
      idMeal: star1.id,
      strMeal: mealNameInner
  }

  fetch(baseurlLocal, {
  method: 'POST', // or 'PUT'
  headers: {
      'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
      fetchFavorites();
  })


}

function deleteFavorite(){
  star1.classList.remove("favorite");

  fetch(baseurlLocal + star1.id, {
      method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => {
      console.log(data)
      fetchFavorites();
  })    
}

// function to toggle alert visibility, and changes html for search query
function toggleAlert(newText){
    alertMsg.classList.toggle("invisible");
    alertMsg.innerHTML = `Your search - <b>${newText}</b> - did not match any recipes.`
}

// function to display recipe
function recipeDisplay(info) {
    mealName.innerHTML = info.strMeal;
    mealImg.src = info.strMealThumb;
    mealImg.alt = `${info.strMeal} image`;
    instruct.textContent = info.strInstructions;

    for (let i = 1; i < 21; i++){ // ingredients each assigned to a new li
        if (info[`strIngredient${i}`] === ""){
            break;
        } else {
            let ingred = document.querySelector("#ingredients");
            let newLi = document.createElement("li");
            newLi.innerHTML = info[`strMeasure${i}`] + " " + info[`strIngredient${i}`];            
            ingred.append(newLi);
        }
    }

    star1.classList.remove("bi-star-fill", "text-warning", "favorite");
    star1.classList.add("bi-star");
    star1.id = info.idMeal
    
    activate();
    document.querySelector("#results").classList.remove("invisible");

}

/* EVENT LISTENERS */
formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    let formValue = document.querySelector("#search-text").value;
    fetch(`${baseurl}search.php?s=${formValue}`)
    .then(response => response.json())
    .then(data => {
        let arr = data.meals;
        if (arr == null) {             // error message
            toggleAlert(formValue);
            setTimeout(function(){
                toggleAlert()
            }, 8000) // error message leaves after 8 seconds
        } else {
            let max = arr.length;
            let rand = randomNumber(max);
            recipeDisplay(arr[rand]);
            // document.querySelector("#results").classList.remove("invisible");
        }
    });
    formSearch.reset();
})


