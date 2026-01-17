// FAST University Course Data - Organized by Semester
const coursesBySemester = {
    "1": [
        "NS1001 Applied Physics",
        "MT1003 Calculus and Analytical Geometry",
        "SS1012 Functional English",
         "SL1012 Functional English Lab",
        "SS1013 Ideology and Constitution of Pakistan",
        "SS1007 Islamic Studies",
        "CL1000 Introduction to Information and Communication Technology",
        "CS1002 Programming Fundamentals",
         "CL1002 Programming Fundamentals Lab",
    ],
    "2": [
        "SS3002 Civics and Community Engagement",
        "SS1015 Pak-Studies",
        "SS1014 Expository Writing",
        "SL1014 Expository Writing Lab",
         "CL1004 Object Oriented Programming Lab",
        "MT1006 Multivariable Calculus",
        "CS1004 Object Oriented Programming",
        "CS1005 Discrete Structure",
    ],
    "3": [
        "EE2003 Computer Organization and Assembly Language",
        "CS2001 Data Structures",
        "ES1005 Digital Logic Design",
         "EL1005 Digital Logic Design Lab",
        "MT1004 Linear Algebra",
        "CS Elective-I",
        "SS1021 Understanding of Holy Quran - I"
    ],
    "4": [
        "CS2005 Database Systems",
        "CS2006 Operating Systems",
        "MT2005 Probability and Statistics",
        "CS3005 Theory of Automata",
        "SS1022 Understanding of Holy Quran - II",
        "SS/MG Elective-I"
    ],
    "5": [
        "CS3003 Artificial Intelligence",
        "CS3001 Computer Networks",
        "CS3010 Design and Analysis of Algorithms",
        "SE2004 Software Engineering",
        "CS Elective-II",
        "SS/MG Elective-II"
    ],
    "6": [
        "CS3002 Compiler Construction",
        "CS3011 Data Science",
        "CS3006 Information Security",
        "SE3001 Software Design and Architecture",
        "CS Elective-III",
        "SS/MG Elective-III"
    ],
    "7": [
        "CS4993 Final Year Project - I",
        "CS Elective-IV",
        "CS Elective-V",
        "SS/MG Elective-IV"
    ],
    "8": [
        "CS4994 Final Year Project - II",
        "CS Elective-VI",
        "CS Elective-VII",
        "SS/MG Elective-V"
    ]
};

// Function to get courses for a specific semester
function getCoursesBySemester(semester) {
    return coursesBySemester[semester] || [];
}

// Function to get all unique courses (for filter dropdown)
function getAllCourses() {
    const allCourses = [];
    for (let semester in coursesBySemester) {
        allCourses.push(...coursesBySemester[semester]);
    }
    return [...new Set(allCourses)].sort();
}

// Function to populate course dropdown based on selected semester
function populateCourseDropdown(semesterValue, courseSelectElement) {
    // Clear existing options
    courseSelectElement.innerHTML = '<option value="">Select Course</option>';
    
    if (!semesterValue) {
        courseSelectElement.disabled = true;
        courseSelectElement.innerHTML = '<option value="">Select Semester First</option>';
        return;
    }
    
    // Get courses for selected semester
    const courses = getCoursesBySemester(semesterValue);
    
    if (courses.length === 0) {
        courseSelectElement.disabled = true;
        courseSelectElement.innerHTML = '<option value="">No courses available</option>';
        return;
    }
    
    // Enable dropdown and populate with courses
    courseSelectElement.disabled = false;
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelectElement.appendChild(option);
    });
}

// Initialize course dropdown listener
document.addEventListener('DOMContentLoaded', function() {
    const semesterSelect = document.getElementById('semester');
    const courseSelect = document.getElementById('course');
    
    if (semesterSelect && courseSelect) {
        semesterSelect.addEventListener('change', function() {
            populateCourseDropdown(this.value, courseSelect);
        });
    }
    
    // Populate filter course dropdown with all courses
    const filterCourseSelect = document.getElementById('filterCourse');
    if (filterCourseSelect) {
        const allCourses = getAllCourses();
        allCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            filterCourseSelect.appendChild(option);
        });
    }
});
