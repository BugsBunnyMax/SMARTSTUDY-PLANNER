# UNIVERSITY OF BUEA
## DEPARTMENT OF COMPUTER ENGINEERING
## PROJECT PROPOSAL: SMARTSTUDY PLANNER
### An AI-Driven Web Application for Academic Management

**CEC418: SOFTWARE CONSTRUCTION AND EVOLUTION**
**LEVEL 400**

**PRESENTED BY:**
- ENONGENE CLOVIS
- MATRICULE: CT23A095

**INSTRUCTOR:** MR. KOMETA DENNIS

---

## 1. Introduction

In the contemporary academic landscape, students are burdened with a high cognitive load, managing complex curricula alongside extracurricular commitments. Traditional planning methods often fail because they are static; they do not account for the fluctuating nature of student productivity or the specific difficulty levels of different tasks.

The SmartStudy Planner seeks to bridge this gap by offering a dynamic, web-based solution. By leveraging AI to analyze completion rates and peak activity times, the system moves beyond a simple "to-do list" to become a proactive academic assistant. This proposal outlines the architectural and functional roadmap for creating a tool that optimizes time rather than just tracking it.

---

## 2. Problem Statement

The primary challenges addressed by this project include:

- **Inelastic Scheduling:** Most apps assume a fixed rate of productivity, leading to "schedule collapse" when one task runs over.
- **Information Fragmentation:** Students use separate tools for notes, deadlines, and calendars, increasing the overhead of organization.
- **Lack of Feedback:** Existing tools do not inform students why they are falling behind or how to adjust.

---

## 3. Objectives of the Project

**General Objective:** To engineer a robust, scalable web application that utilizes behavioral data to provide adaptive study schedules for university students.

**Specific Objectives:**

- Develop a secure authentication module using JWT for data privacy.
- Build a CRUD-based task engine with priority-level tagging.
- Integrate a FullCalendar-based UI for seamless time blocking.
- Implement a logic-based AI engine to re-prioritize tasks based on deadline proximity and historical performance.

---

## 4. Scope of the Project

The project focuses on creating a "Minimum Viable Product" (MVP) that is technically sound and extensible:

- **Functional Scope:** Secure login, task lifecycle management (Create, Read, Update, Delete), real-time progress bars, and a recommendation engine.
- **Data Scope:** The system will store user profiles, task metadata (tags, estimated duration, actual duration), and login sessions.
- **UI/UX Scope:** A responsive dashboard optimized for desktop browsers, featuring a dark/light mode toggle and intuitive navigation.

**Detail on AI Recommendations:** The scope includes "Study Buffers." If the system detects a pattern of late submissions for Mathematics, it will automatically add a 20% time buffer to future Math-related tasks.

---

## 5. Methodology

We will adopt the Agile Scrum framework. This allows for iterative development where features are built in "Sprints."

- **Sprint 1:** Backend setup, Database schema design, and API routing.
- **Sprint 2:** Frontend UI development and State Management (Redux/Context API).
- **Sprint 3:** Integration of AI logic and automated testing.

---

## 6. System Overview / Proposed Solution

The SmartStudy Planner follows a 3-tier architecture:

- **Presentation Tier:** Built with React.js, providing a dynamic single-page application (SPA) experience.
- **Application Tier:** A Node.js/Express server that processes business logic, handles AI calculations, and manages authentication.
- **Data Tier:** A MongoDB Atlas cloud instance for flexible, JSON-like document storage.

When a user updates a task status, the backend triggers the recommendation engine, which recalculates the "Optimized Schedule" for the following day based on remaining work and past speed.

---

## 7. Technology Stack

The choice of technology focuses on high performance and developer productivity:

- **Frontend:** React.js for component-based UI and Tailwind CSS for rapid, responsive styling.
- **Backend:** Node.js with Express, chosen for its non-blocking I/O, which is ideal for real-time task updates.
- **Database:** MongoDB (NoSQL) allows for evolving task schemas without complex migrations.
- **State Management:** React Context API to keep the dashboard synced with the backend in real-time.

---

## 8. AI / Machine Learning Component

Unlike complex neural networks, this AI utilizes Heuristic Rule-Based Algorithms and Linear Regression to estimate task completion times. The core logic includes:

- **Productivity Mapping:** Identifies if the user is more active in AM or PM hours.
- **Task Weighting:** Assigns "difficulty scores" to courses.
- **Automatic Rescheduling:** If a deadline is missed, the AI shifts lower-priority tasks to the next available block.

---

## 9. DevOps & Modern Engineering Tools

To ensure "Software Evolution" (as per course title), we use:

- **Docker:** To containerize the application, ensuring that "it works on my machine" translates to the server.
- **GitHub Actions:** For Continuous Integration (CI). Every code push is automatically checked for errors before being merged.
- **Vercel/Render:** For automated deployment of the frontend and backend.

---

## 10. Project Management & Expected Outcomes

The project will be managed using a GitHub Project Board (Kanban style). This keeps track of "To-Do," "In-Progress," and "Done" states, minimizing management complexity.

**Expected Outcomes:**

- A fully functional URL where students can manage their tasks.
- A technical report detailing the AI logic and system architecture.
- A cleaner, less stressed academic workflow for the end-user.

---

## 11. Project Timeline

| Phase | Activities | Duration |
|-------|-----------|----------|
| Planning | Requirements, UI Mockups | 1 Week |
| Design | DB Schema, API Docs | 1 Week |
| Development | Frontend & Backend Coding | 3 Weeks |
| Testing | Unit & Integration Testing | 1 Week |
| Deployment | Cloud Setup, Final Review | 1 Week |

---

## 12. Conclusion

The SmartStudy Planner is more than a tool; it is a solution to the modern student's struggle with time management. By integrating AI and modern DevOps, this project fulfills the requirements of CEC418 while delivering a high-utility product for the University of Buea community.

---

**Document Version:** 1.0  
**Date:** May 27, 2026  
**Status:** Proposal Finalized
