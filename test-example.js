import Amadeus from './dist/index.js';

const amadeus = new Amadeus({
  clientId: '-',
  clientSecret: '-'
});

amadeus.shopping.flightOffersSearch.get({
    originLocationCode: 'SYD',
    destinationLocationCode: 'BKK',
    departureDate: '2025-06-01',
    adults: '2'
}).then(function(response){
  console.log(response);
}).catch(function(responseError){
  console.log(responseError);
});