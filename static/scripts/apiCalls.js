const apiRoot = "https://api.myrevision.net";

function initialiseBasic() {
    setTimeout(() => {
        userSession.loaderVal = 1;
        initialiseAuth(); 
    }, 1);
}

async function callGetAPI(api, apiResults, isRetrieve = true) {
    var data = {};
    var errorMessage = "";

    if(isRetrieve) {
        errorMessage = "There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later.";
    } else {
        errorMessage = "There was an error changing " + apiResults + ". Please check your internet connection and try again later.";
    }

    showLoader();

    data = await getAPIGetResult(api, errorMessage);

    hideLoader();

    return data;
}

//A function to get the results from a REST api with a GET method
///api: the api to get results from
async function getAPIGetResult(api, errorMessage) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, takes in the api and a callback function

        $.ajax({
            url: api,
            success: function (json) {
                resolve(json);
            },
            error: function (aXMLHttpRequest, textStatus, errorThrown) {
                reject(errorMessage + "<br> Error code " + aXMLHttpRequest.status + " --- " + aXMLHttpRequest.responseText);
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", userSession.auth.accessToken);
            },
            type: 'GET',
            contentType: 'json'
        });
    });
}

async function callPostAPI(api, postBody, apiResults, isRetrieve = true) {
    var data = {};
    var errorMessage = "";

    if(isRetrieve) {
        errorMessage = "There was an error retrieving " + apiResults + " from our servers. Please check your internet connection and try again later.";
    } else {
        errorMessage = "There was an error creating " + apiResults + ". Please check your internet connection and try again later.";
    }

    showLoader();

    data = await getAPIPostResult(api, postBody, errorMessage);

    hideLoader();

    return data;
}

//A function to get the results from a REST api with a POST method
///api: the api to get results from
///postBody: the data to be posted
async function getAPIPostResult(api, postBody, errorMessage) {
    //Get result
    ///Uses a promise structure to allow the use of the await keyword when calling the function. Easy way of making asynchronous code synchronous in javascript 
    return new Promise((resolve, reject) => {
        ///Uses jquery to easily call the api, passes in the API, the post body, a callback function and the format of the post body

        $.ajax({
            url: api,
            success: function (json) {
                resolve(json);
            },
            error: function (aXMLHttpRequest, textStatus, errorThrown) {
                reject(errorMessage + " <br> Error code " + aXMLHttpRequest.status + " --- " + aXMLHttpRequest.responseText);
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", userSession.auth.accessToken);
            },
            data: JSON.stringify(postBody),
            type: 'POST',
            contentType: 'json'
        });
    });
}

function startIdler(idlerValue) {
    const idlerLimit = 250000;
    const idlerIteration = 50000;

    userSession.idlerStart = Date.now();
    userSession.idlerValue = idlerValue;
    sessionStorage.setItem("idlerValue", userSession.idlerValue);

    userSession.idler = setInterval(() => {
        userSession.idlerValue += parseInt(Date.now() - userSession.idlerStart);
        sessionStorage.setItem("idlerValue", userSession.idlerValue);
        //console.log(userSession.idlerValue);

        userSession.idlerStart = Date.now();

        if(userSession.idlerValue > idlerLimit) {
            callColdStartAPI();
            userSession.idlerValue = 0;
        }
    }, idlerIteration);
}

function endIdler() {
    clearTimeout(userSession.idler());
}

async function callColdStartAPI () {
    try {
        var api = apiRoot + "/cold-start";
        var isDBOnline = false;

        showLoader();

        do {
            isDBOnline = await getAPIGetResult(api, "There was an error retrieving data from our servers. Please check your internet connection and try again later.");

            await sleep(1000);

            if(isDBOnline){
                hideLoader();
            }

        } while (!isDBOnline);
    } catch (err) {
        generateErrorBar(err);
    }
}

async function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve(true), milliseconds));
}

function showLoader() {
    userSession.loaderVal++;

    if(userSession.loaderVal == 1)
    {
        $("#loader-container").show();
        adaptHeaderBar("");
    }
}

function hideLoader(isError = false) {
    if (isError) {
        userSession.loaderVal = 0;
    } else {
        userSession.loaderVal--;
    }

    if(userSession.loaderVal == 0)
    {
        $("#loader-container").hide();
        adaptHeaderBar(userSession.auth.accessLevel);
    }
}

