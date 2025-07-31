import { readJSON, writeJSON } from '../utils/database.js';

const ASSIGNMENTS_FILE = './data/assignments.json';

// Get all assignments
export function getAllAssignments() {
  return readJSON(ASSIGNMENTS_FILE, []);
}

// Get active assignments (not expired)
export function getActiveAssignments() {
  const assignments = getAllAssignments();
  const now = new Date();
  
  return assignments.filter(assignment => {
    const deadline = new Date(assignment.deadline);
    return deadline > now;
  });
}

// Get pending tasks (for reminders)
export function getPendingTasks() {
  return getActiveAssignments();
}

// Add a new assignment
export function addAssignment(assignment) {
  try {
    const assignments = getAllAssignments();
    assignments.push(assignment);
    const success = writeJSON(ASSIGNMENTS_FILE, assignments);
    
    if (success) {
      console.log(`Assignment added: ${assignment.title} (ID: ${assignment.id})`);
      return true;
    } else {
      console.error('Failed to save assignment to file');
      return false;
    }
  } catch (error) {
    console.error('Error adding assignment:', error);
    return false;
  }
}

// Remove an assignment
export function removeAssignment(assignmentId, userId) {
  const assignments = getAllAssignments();
  const index = assignments.findIndex(a => a.id === assignmentId);
  
  if (index === -1) {
    return { success: false, message: "التكليف غير موجود" };
  }
  
  const assignment = assignments[index];
  
  // Only the creator can remove the assignment
  if (assignment.createdBy !== userId) {
    return { success: false, message: "لا يمكنك حذف هذا التكليف لأنك لست المنشئ" };
  }
  
  assignments.splice(index, 1);
  writeJSON(ASSIGNMENTS_FILE, assignments);
  
  return { success: true, assignment };
}

// Mark an assignment as done
export function markAssignmentAsDone(assignmentId, userId) {
  const assignments = getAllAssignments();
  const assignment = assignments.find(a => a.id === assignmentId);
  
  if (!assignment) {
    return { success: false, message: "التكليف غير موجود" };
  }
  
  if (assignment.completedBy.includes(userId)) {
    return { success: false, message: "لقد أكملت هذا التكليف بالفعل" };
  }
  
  assignment.completedBy.push(userId);
  writeJSON(ASSIGNMENTS_FILE, assignments);
  
  return { success: true, assignment };
}
