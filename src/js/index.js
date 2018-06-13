
// http://food2fork.com/api/search
// api_key: aacc04aa6920816dd91c8e84ef80c7c2
// https://cors-anywhere.herokuapp.com/


import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import {elements, renderLoader, clearLoader} from './views/base';


/*** Golabal state of the app
 * - serach object
 * - current recipe object
 * - shopping list object
 * - Liked recipes
 */

const state = {};

/**
 * SEARCH CONTROLLER
 */
const controllSearch = async() =>{
    //1. Get query form the view
    const query = searchView.getInput();

    console.log(query);

    if (query){
        //2. New search object and add to state
        state.search = new Search(query);
        //3. Prepre UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {

            //4. Search for recipes
            await state.search.getResults();

            //5. Render results on the UI
            // console.log(state.search.result)
            clearLoader();
            searchView.renderResults(state.search.result);

        } catch (error) {
            alert('Something wrong with te search...');
            clearLoader();

        }
        
    }
}

elements.searchForm.addEventListener('submit',e =>{
    e.preventDefault();
    controllSearch();
});

elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
        // console.log(goToPage);
    }
});


/**
 * RECIPE CONTROLLER
 */

const controllRecipe = async () => {
    //Get id from Url
    const id = window.location.hash.replace('#','');
    // console.log(id);

    if(id){

        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight slected search item

        if(state.search){
            searchView.highlightSelected(id);

        };


        //Create new recipe object
        state.recipe = new Recipe(id);

        
        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
            alert('Error processing recipe!');
        }
        
    }
}


// window.addEventListener('hashchange',controllRecipe);
// window.addEventListener('load',controllRecipe);

['hashchange','load'].forEach(event => window.addEventListener(event,controllRecipe));


/**
 * LIST CONTROLLER
 */

const controllList = () => {
    //Create list if there is none yet

    if(!state.list) state.list = new List();

    //Add each ingredient to the list 

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit ,el.ingredient);
        listView.renderItem(item);
    });
};

//Handle delete and update item event
elements.shopping.addEventListener('click',e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Ha the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);

    //Hendle the count update
    }else if(e.target.matches('.shopping__count-value ')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id,val);
    }

});

/**
 * Like CONTROLLER
 */


const controllLike = () =>{
    if(!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;

    
    //User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        //Add like to the data
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Togle the like button
        likesView.toggleLikeBtn(true);
        //Add like to UI list
        console.log(state.likes);
        likesView.renderLike(newLike);
        //User has  liked current recipe    
    }else{
        //Remove like to the data
        state.likes.deleteLike(currentID);
        //Togle the like button
        likesView.toggleLikeBtn(false);
        //Remove like to UI list
        console.log(state.likes);
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());

};


// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

//Hendling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
         //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);


    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controllList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controllLike();
    }
    
});

