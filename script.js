document.addEventListener("DOMContentLoaded", () => {
    // Get references to necessary DOM elements
    const taskForm = document.getElementById("task-form");
    const taskList = document.getElementById("task-list");
    const searchInput = document.getElementById("search");
    const priorityFilter = document.getElementById("priority-filter");
    const emptyState = document.getElementById("empty-state");
    
    // Load tasks from localStorage or initialize an empty array
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // Save tasks to localStorage and update empty state visibility
    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        checkEmptyState();
    };
    
    // Check if task list is empty and update the empty state message
    const checkEmptyState = () => {
        const filteredTasks = tasks.filter(task => 
            (priorityFilter.value === "all" || task.priority === priorityFilter.value) &&
            task.title.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        
        if (filteredTasks.length === 0) {
            emptyState.classList.remove("hidden");
        } else {
            emptyState.classList.add("hidden");
        }
    };

    // Format date for displaying in the task list
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Return the appropriate icon class for each priority level
    const getPriorityIcon = (priority) => {
        switch(priority) {
            case 'high': return 'fa-flag';
            case 'medium': return 'fa-dot-circle';
            case 'low': return 'fa-circle';
            default: return 'fa-circle';
        }
    };

    // Display tasks based on filter and search criteria
    const displayTasks = (filter = "all", search = "") => {
        taskList.innerHTML = ""; // Clear the current task list
        
        const filteredTasks = tasks.filter(task => 
            (filter === "all" || task.priority === filter) &&
            task.title.toLowerCase().includes(search.toLowerCase())
        );
        
        // Iterate through filtered tasks and create list elements
        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.classList.add(task.priority);
            taskItem.innerHTML = `
                <strong>${task.title}</strong>
                <p>${task.description || "No description provided."}</p>
                <div class="task-meta">
                    <div class="task-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Due: ${formatDate(task.date)}</span>
                    </div>
                    <div class="task-priority">
                        <i class="fas ${getPriorityIcon(task.priority)}"></i>
                        <span class="priority-badge-${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-edit" onclick="editTask(${index})">
                        <i class="fas fa-edit"></i>Edit
                    </button>
                    <button class="btn-delete" onclick="deleteTask(${index})">
                        <i class="fas fa-trash"></i>Delete
                    </button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
        
        checkEmptyState();
    };

    // Handle form submission to add a new task
    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("task-title").value.trim();
        const description = document.getElementById("task-desc").value.trim();
        const date = document.getElementById("task-date").value;
        const priority = document.getElementById("task-priority").value;
        
        if (!title || !date) {
            showNotification("Title and Due Date are required", "error");
            return;
        }
        
        tasks.push({ title, description, date, priority });
        saveTasks();
        displayTasks(priorityFilter.value, searchInput.value);
        taskForm.reset();
        showNotification("Task added successfully!", "success");
    });

    // Edit an existing task
    window.editTask = (index) => {
        const task = tasks[index];
        document.getElementById("task-title").value = task.title;
        document.getElementById("task-desc").value = task.description || "";
        document.getElementById("task-date").value = task.date;
        document.getElementById("task-priority").value = task.priority;
        
        document.querySelector(".box").scrollIntoView({ behavior: 'smooth' });
        document.getElementById("task-title").focus();
        
        tasks.splice(index, 1); // Remove task from the list before saving
        saveTasks();
        displayTasks(priorityFilter.value, searchInput.value);
        
        showNotification("Task ready to edit", "info");
    };

    // Delete a task with confirmation
    window.deleteTask = (index) => {
        if (confirm("Are you sure you want to delete this task?")) {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks(priorityFilter.value, searchInput.value);
            showNotification("Task deleted", "success");
        }
    };
    
    // Show a notification message
    const showNotification = (message, type = "info") => {
        let notificationContainer = document.querySelector(".notification-container");
        
        if (!notificationContainer) {
            notificationContainer = document.createElement("div");
            notificationContainer.className = "notification-container";
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notificationContainer.appendChild(notification);
        notification.querySelector(".notification-close").addEventListener("click", () => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add("fade-out");
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    };
    
    // Initialize event listeners
    searchInput.addEventListener("input", () => displayTasks(priorityFilter.value, searchInput.value));
    priorityFilter.addEventListener("change", () => displayTasks(priorityFilter.value, searchInput.value));
    
    // Initial display of tasks
    displayTasks();
});
