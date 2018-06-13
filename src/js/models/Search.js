import axios from 'axios';
import {key, proxy} from '../config';

export default class Search {

    constructor(query){
        this.query = query;
    }

    async getResults() {
        // const proxy = 'https://cors-anywhere.herokuapp.com/';
        // const key = 'aacc04aa6920816dd91c8e84ef80c7c2';
        
        try {
            const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
    
        } catch (error) {
            alert(error);
        }
    }
}