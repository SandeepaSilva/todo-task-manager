// =========================================================================
// 1. HTML ELEMENTS
// Grab the objects from our webpage to use them here.
// =========================================================================
const inputElement = document.getElementById("task-input");
const addButtonElement = document.getElementById("add-btn");
const listElement = document.getElementById("task-list");
const totalText = document.getElementById("total-count");
const completedText = document.getElementById("completed-count");
const filterButtons = document.querySelectorAll(".filter-btn");

// =========================================================================
// 2. OUR VARIABLES
// =========================================================================
let myTasksArray = [];       // Our main list of data
let activeFilter = "all";    // Determines which tasks to show right now

// This URL is exactly where our Node.js Backend Server is running!
// 👉 IMPORTANT FOR DEPLOYMENT: When uploading it online, swap the two lines below:
let backendServerURL = "http://localhost:3000/tasks";          // Use this for testing on your own PC
// let backendServerURL = "https://your-backend-url/tasks";    // Use this when deploying live

// =========================================================================
// 3. FETCH DATA (TALKING TO THE BACKEND)
// =========================================================================
async function getTasksFromDatabase() {
    // Send a GET request to our server to ask for the data
    let serverResponse = await fetch(backendServerURL);
    
    // Turn the response into a Javascript Array we can use
    let tasksList = await serverResponse.json();
    
    // Copy the server data into our local array
    myTasksArray = tasksList;
    
    // Draw the array onto the screen finally
    drawTasksToScreen();
}

// =========================================================================
// 4. DRAW TASKS ON SCREEN
// This is called constantly to make sure the screen always looks correct
// =========================================================================
function drawTasksToScreen() {
    // Wipe the list slate clean before redrawing
    listElement.innerHTML = "";
    
    let totalCompleted = 0;
    let totalDrawn = 0;

    // Use a basic loop to go through all our tasks one by one
    for (let i = 0; i < myTasksArray.length; i = i + 1) {
        
        let singleTask = myTasksArray[i];
        
        // Let's count how many are totally completed
        if (singleTask.completed === true) {
            totalCompleted = totalCompleted + 1;
        }

        // --- FILTERING ---
        // If the filter says "pending" but it IS done, skip drawing it 
        if (activeFilter === "pending" && singleTask.completed === true) {
            continue; 
        }
        // If the filter says "completed" but it IS NOT done, skip drawing it 
        if (activeFilter === "completed" && singleTask.completed === false) {
            continue;
        }

        // We passed the filter, so let's track that we drew an item
        totalDrawn = totalDrawn + 1;

        // Build our List Item element
        let liItem = document.createElement("li");
        liItem.className = "task-item";
        
        // If it is checked, we add a class to make it faded out, and check the box
        let isCheckedText = "";
        
        if (singleTask.completed === true) {
            liItem.className = "task-item completed";
            isCheckedText = "checked";
        }

        // Add the HTML structure. 
        // Notice we use "singleTask._id" because MongoDB creates special ID strings!
        liItem.innerHTML = `
            <div class="task-content" onclick="clickTask('${singleTask._id}')">
                <input type="checkbox" class="task-checkbox" ${isCheckedText}>
                <span class="task-text">${singleTask.title}</span>
            </div>
            <button class="delete-btn" onclick="eraseTask('${singleTask._id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        // Finally attach it to the list
        listElement.appendChild(liItem);
    }

    // EMPTY STATE Check
    if (totalDrawn === 0) {
        listElement.innerHTML = '<li class="empty-state">No tasks yet</li>';
    }

    // Update Counters
    totalText.innerText = "Total: " + myTasksArray.length;
    completedText.innerText = "Completed: " + totalCompleted;
}

// =========================================================================
// 5. CREATE A NEW TASK
// =========================================================================
async function createNewTask() {
    let inputtedText = inputElement.value;

    if (inputtedText === "") {
        alert("Please write something!");
        return; 
    }

    // Combine our text into a neat package
    let dataToSend = { title: inputtedText };

    // Send the package to our backend using a POST request
    let response = await fetch(backendServerURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
    });
    
    // Get the newly created database object back from our server
    let savedTask = await response.json();

    // Push it onto our local array, and instantly redraw!
    myTasksArray.push(savedTask);
    drawTasksToScreen();

    // Empty input 
    inputElement.value = "";
}

// =========================================================================
// 6. TOGGLE A CHECKMARK
// =========================================================================
async function clickTask(mongoDatabaseId) {
    let changedStatus = false;

    // Use a loop to instantly update our local array to feel very fast for the user
    for (let i = 0; i < myTasksArray.length; i = i + 1) {
        if (myTasksArray[i]._id === mongoDatabaseId) {
            
            // Flip between true / false
            if (myTasksArray[i].completed === false) {
                myTasksArray[i].completed = true;
                changedStatus = true;
            } else {
                myTasksArray[i].completed = false;
                changedStatus = false;
            }
        }
    }
    
    // The screen updates instantly!
    drawTasksToScreen();

    // In the background, send a PUT request to update the database silently
    await fetch(backendServerURL + "/" + mongoDatabaseId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: changedStatus })
    });
}

// =========================================================================
// 7. ERASE A TASK
// =========================================================================
async function eraseTask(mongoDatabaseId) {
    
    let arrayWithoutErasedItem = [];
    
    // We make an entirely new array, putting everything inside EXCEPT the erased item
    for (let i = 0; i < myTasksArray.length; i = i + 1) {
        if (myTasksArray[i]._id !== mongoDatabaseId) {
            arrayWithoutErasedItem.push(myTasksArray[i]);
        }
    }
    myTasksArray = arrayWithoutErasedItem;
    
    // Draw the list instantly!
    drawTasksToScreen();

    // In the background, send a DELETE request to completely remove it from MongoDB
    await fetch(backendServerURL + "/" + mongoDatabaseId, {
        method: "DELETE" 
    });
}

// =========================================================================
// 8. FILTER MECHANISM
// =========================================================================
for (let i = 0; i < filterButtons.length; i = i + 1) {
    
    filterButtons[i].addEventListener("click", function() {
        
        // Using a loop to erase the blue "active" button color everywhere 
        for (let j = 0; j < filterButtons.length; j = j + 1) {
            filterButtons[j].classList.remove("active");
        }
        
        // Recolor just the button we clicked
        filterButtons[i].classList.add("active");
        
        // Grab what filter we clicked 
        activeFilter = filterButtons[i].getAttribute("data-filter");
        
        // Finally, draw the tasks applying our new filter
        drawTasksToScreen();
    });
}

// =========================================================================
// 9. EVENT LISTENERS
// =========================================================================
addButtonElement.addEventListener("click", createNewTask);

inputElement.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        createNewTask();
    }
});

// =========================================================================
// 10. BOOTUP!
// Grab everything from MongoDB to start
// =========================================================================
getTasksFromDatabase();
