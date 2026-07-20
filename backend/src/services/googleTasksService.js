// src/services/googleTasksService.js

/**
 * Google Tasks Service (Temporary Stub)
 * -------------------------------------
 * These functions let your backend run WITHOUT the real Google API.
 * Later, you can replace the inside of each function with real API calls.
 * this pretend to create, update, and delete Google Tasks.
 */

// CREATE Google Task
export const createGoogleTask = async (userId, task) => {
  console.log("Mock: Creating Google Task for user:", userId);

  return {
    id: "google-task-" + Date.now(), // fake unique ID
    status: "needsAction",
    due: task.deadline || null,
    updated: new Date()
  };
};

// UPDATE Google Task
export const updateGoogleTask = async (userId, task, googleTaskId) => {
  console.log("Mock: Updating Google Task:", googleTaskId);

  return {
    id: googleTaskId,
    status: task.google_status || "needsAction",
    due: task.deadline || null,
    updated: new Date()
  };
};

// DELETE Google Task
export const deleteGoogleTask = async (userId, googleTaskId) => {
  console.log("Mock: Deleting Google Task:", googleTaskId);

  return true;
};
