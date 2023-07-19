import axios from 'axios';

interface IAddress{
    street : string;
    suite : string;
    city : string;
    zipcode : string;
    geo : {
        lat : string;
        lng : string;
    }
}

export interface IUsers{
    id : number;
    name : string;
    email : string;
    address : IAddress;
    phone : string;
    website : string;
    company : {
        name : string;
        catchPhrase : string;
        bs : string;
    };
    [key:string] : any;
}

export const getUserList = async() => await axios.get<IUsers[]>("https://jsonplaceholder.typicode.com/users");