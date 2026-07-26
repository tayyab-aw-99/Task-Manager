const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const search = document.getElementById("search");

// Dashboard
const total = document.getElementById("total");
const completed = document.getElementById("completed");
const pending = document.getElementById("pending");
const taskCount = document.getElementById("taskCount");

let editId = null;
let currentPage = 1;
let totalTasks = 0;
const tasksPerPage = 5;
let currentFilter = "all";


// ===========================
// FORMAT DATE
// ===========================

function formatDate(dateString) {
    if (!dateString) {
        return "No Date";
    }
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return "No Date";
        }
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
    } catch (error) {
        return "No Date";
    }
}


// ===========================
// TOAST FUNCTION
// ===========================

function showToast(message, type="success") {

    const toast = document.getElementById("toast");

    let icon = "fa-circle-check";

    if(type === "error"){
        icon = "fa-circle-xmark";
    }

    if(type === "warning"){
        icon = "fa-triangle-exclamation";
    }

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove("show");
    },3000);

}


addBtn.addEventListener("click", addTask);


// ===========================
// ADD / UPDATE TASK
// ===========================

async function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {

        showToast("Please Enter Task","warning");
        return;

    }


    const formData = new FormData();

    formData.append("title", title);


    let url = "/tasks";
    let method = "POST";


    if(editId !== null){

        url = `/tasks/${editId}`;
        method = "PUT";

    }


    try {


        const response = await fetch(url, {

            method: method,
            body: formData

        });


        if(!response.ok){

            showToast("Failed to save task.","error");
            return;

        }


        const data = await response.json();


        if(data.message){

            showToast(data.message,"success");

        }


        taskInput.value = "";

        editId = null;


        addBtn.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            Add Task
        `;

        currentPage = 1;
        loadTasks(currentPage);



    } catch(error){


        console.log(error);

        showToast("Something went wrong.","error");


    }


}



// ===========================
// LOAD TASKS
// ===========================

async function loadTasks(page = 1){


    try{

        const skip = (page - 1) * tasksPerPage;
        const response = await fetch(`/tasks?skip=${skip}&limit=${tasksPerPage}`);


        if(!response.ok){

            console.error("Failed to load tasks");
            return;

        }


        let data = await response.json();
        let tasks = data.tasks;
        totalTasks = data.total;



        // Search Filter

        const keyword = search.value.toLowerCase().trim();



        if(keyword !== ""){


            tasks = tasks.filter(task =>

                task.title.toLowerCase().includes(keyword)

            );


        }


        // Status Filter

        if(currentFilter === "pending"){

            tasks = tasks.filter(task => !task.completed);

        } else if(currentFilter === "completed"){

            tasks = tasks.filter(task => task.completed);

        }



        taskList.innerHTML = "";



        // Dashboard


        const completedTasks = tasks.filter(task => task.completed).length;


        total.innerText = totalTasks;

        completed.innerText = completedTasks;

        pending.innerText = totalTasks - completedTasks;


        taskCount.innerText =
        `${totalTasks} Task${totalTasks !== 1 ? "s" : ""}`;





        if(tasks.length === 0){


            taskList.innerHTML = `

                <div class="empty">

                    <h3>No Tasks Found</h3>

                </div>

            `;


            renderPagination();
            return;


        }




        // Show Tasks


        tasks.forEach(task => {


            taskList.innerHTML += `


            <div class="task ${task.completed ? "done" : ""}">


                <div>


                    <h3>${task.title}</h3>


                    <div class="task-meta">

                        <p class="status">
                            ${task.completed ? "Completed ✅" : "Pending ⏳"}
                        </p>

                        <p class="date">
                            <i class="fa-solid fa-calendar"></i> ${formatDate(task.created_date)}
                        </p>

                    </div>


                </div>



                <div class="actions">


                    <button 
                    class="complete"
                    onclick="toggleTask(${task.id})">

                        ${task.completed ? "Undo" : "Done"}

                    </button>



                    <button
                    class="edit"
                    onclick="editTask(${task.id}, '${task.title.replace(/'/g,"\\'")}')">

                        Edit

                    </button>




                    <button
                    class="delete"
                    onclick="deleteTask(${task.id})">

                        Delete

                    </button>



                </div>


            </div>


            `;


        });

        renderPagination();


    }
    catch(error){

        console.log(error);

    }


}




// ===========================
// RENDER PAGINATION
// ===========================

function renderPagination(){

    const paginationContainer = document.getElementById("pagination");
    
    if(!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalTasks / tasksPerPage);

    if(totalPages <= 1) return;

    // Previous button
    if(currentPage > 1){
        const prevBtn = document.createElement("button");
        prevBtn.innerText = "← Previous";
        prevBtn.className = "pagination-btn";
        prevBtn.onclick = () => {
            currentPage--;
            loadTasks(currentPage);
        };
        paginationContainer.appendChild(prevBtn);
    }

    // Page numbers
    for(let i = 1; i <= totalPages; i++){
        const pageBtn = document.createElement("button");
        pageBtn.innerText = i;
        pageBtn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
        pageBtn.onclick = () => {
            currentPage = i;
            loadTasks(currentPage);
        };
        paginationContainer.appendChild(pageBtn);
    }

    // Next button
    if(currentPage < totalPages){
        const nextBtn = document.createElement("button");
        nextBtn.innerText = "Next →";
        nextBtn.className = "pagination-btn";
        nextBtn.onclick = () => {
            currentPage++;
            loadTasks(currentPage);
        };
        paginationContainer.appendChild(nextBtn);
    }

}




// ===========================
// EDIT TASK
// ===========================

function editTask(id,title){


    editId = id;


    taskInput.value = title;


    taskInput.focus();



    addBtn.innerHTML = `

        <i class="fa-solid fa-pen"></i>

        Update Task

    `;


}





// ===========================
// COMPLETE / UNDO
// ===========================

async function toggleTask(id){


    try{


        const response = await fetch(`/tasks/${id}`,{

            method:"PATCH"

        });



        if(!response.ok){

            showToast("Failed to update task.","error");
            return;

        }



        const data = await response.json();



        if(data.message){

            showToast(data.message,"success");

        }

        loadTasks(currentPage);



    }
    catch(error){


        console.log(error);


        showToast("Unable to update task.","error");


    }


}






// ===========================
// DELETE TASK
// ===========================

async function deleteTask(id){


    if(!confirm("Delete this task?")){

        return;

    }



    try{


        const response = await fetch(`/tasks/${id}`,{


            method:"DELETE"


        });



        if(!response.ok){

            showToast("Delete failed.","error");
            return;

        }



        const data = await response.json();



        if(data.message){

            showToast(data.message,"success");

        }

        currentPage = 1;
        loadTasks(currentPage);



    }
    catch(error){


        console.log(error);


        showToast("Delete failed.","error");


    }


}





// ===========================
// SEARCH
// ===========================

search.addEventListener("keyup",function(){

    currentPage = 1;
    loadTasks(currentPage);


});




// ===========================
// FILTER TASKS
// ===========================

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {

    button.addEventListener("click", function(){

        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        // Update current filter
        currentFilter = this.getAttribute("data-filter");

        // Reset to page 1 and load tasks
        currentPage = 1;
        loadTasks(currentPage);

    });

});




// ===========================
// ENTER KEY SUPPORT
// ===========================

taskInput.addEventListener("keypress",function(e){


    if(e.key === "Enter"){


        addTask();


    }


});




// ===========================
// PAGE LOAD
// ===========================

loadTasks(currentPage);