//Manages the redirects based on the user's access level
function redirect () {
    //Manage Redirects
    ///Guests go back to the home page, students go to questions, teachers go to assignments, and admins go to assignments aswell
    switch (userSession.auth.accessLevel) {
        case "guest":
            window.location.replace(baseURL);
            break;
        
        case "student":
            window.location.replace(baseURL + "questions");
            break;
        
        case "teacher":
            window.location.replace(baseURL + "edit-assignments");
            break;
        
        case "admin":
            window.location.replace(baseURL + "edit-assignments");
            break;
    }
}

//Runs when the code loads - the timeout buffers until the full page loads
///Runs the initialise function in case more than one function call is needed
window.onload = function(){
    setTimeout(initialise, 1);
};
 
//Runs when the page loads
async function initialise(){
    userSession.loaderVal = 1;
 
    //Function calls
    await initialiseAuth(); 

    redirect();
}