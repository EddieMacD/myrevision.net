//Generates a bar at the top of the screen to show the user what has gone wrong and an explanation
///text: the error message that is to be displayed
function generateErrorBar(text) {
    //Variables
    ///An array to store the error bar construct
    var errorBar = [];

    //HTML
    ///Pushes a row, a column and a label to the error bar. Each with the respective style classes and the inputted text in the label
    errorBar.push(
        "<div class='row error-row'>",
            "<div class='col-xs-12 error-col'>",
                "<label class='error-label'>" + text + "</label>",
            "</div>",
        "</div>",
    );

    ///Appends the error bar to the correct container at the top of the page
    $("#error-container").append(errorBar.join(""));

    //$("#loader-box").hide();
}

//Clears any error bars that may be on screen
function clearErrorBar () {
    //Empties the error bar container
    $("#error-container").empty();
}