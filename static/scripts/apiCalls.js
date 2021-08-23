function initialiseBasic () {
    initialiseAuth(); 

    $("#loader-box").hide();
}

async function callGetAPI(api, apiResults) {
    var data = {};

    $("#loader-box").show();

    data = await getAPIGetResult(api, apiResults);

    $("#loader-box").hide();

    return data;
}

//A function to get the results from a REST api with a GET method
///api: the api to get results from
async function getAPIGetResult(api, apiResults) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, takes in the APi and a callback function
        $.get(api, html => {
            //resolve returns the data passed into it to the promise, which sends it to the 
            resolve(html);
        }).fail((error) => {
            ///The fail function rejects the promise, throwing an exception with the inputted text. The error is used to create a neat error meddage to post to the try catch 
            reject("There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later. <br> Error code " + error.status + " --- " + error.responseText);
        });
    });
}

async function callPostAPI(api, postBody, apiResults) {
    var data = {};

    $("#loader-box").show();

    data = await getAPIPostResult(api, postBody, apiResults);

    $("#loader-box").hide();

    return data;
}

//A function to get the results from a REST api with a POST method
///api: the api to get results from
///postBody: the data to be posted
async function getAPIPostResult(api, postBody, apiResults) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, passes in the API, the post body, a callback function and the format of the post body
        $.post(api, JSON.stringify(postBody), data => {
            resolve(data);
        }).fail((error) => {
            ///The fail function rejects the promise, throwing an exception with the inputted text. The error is used to create a neat error meddage to post to the try catch 
            reject("There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later. <br> Error code " + error.status + " --- " + error.responseText);
        }, "json");
    });
}