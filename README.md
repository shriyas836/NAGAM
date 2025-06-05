# NAGAM-A Nagar Nigam Website

## Description

NAGAM is a modern web platform proposed for Nagar Nigam Tonk. It is designed to improve communication between Nagar Nigam and the public, making municipal services more accessible and efficient. The portal allows citizens to easily access information about municipal projects, register complaints, submit feedback, and interact with a built-in chatbot for assistance.
For administrators, NAGAM provides a dedicated dashboard to view and manage citizen complaints, respond to feedback, and register new employees. The platform simplifies public grievance handling and improves transparency in municipal operations.

## Technologies Used

Frontend: HTML , CSS , JavaScript
Backend: Node.js , Express.js
Database: MySQL

## Features

### For Civilians(Users)

• View static informational pages related to Nagar Nigam and its projects.
• Access and interact with chatbot for common queries.
• Use contact Information and important Links related to Nagar Nigam.
• Register/Login system:
    - New users can sign up and then login.
    - Forgot password with OTP generation via E-mail.
    - After login, users can:
      -Register complaints related to:
        -Sewage
        -Garbage
        -Street Lights
        -Stray Animals
• Submit feedback about services.
• User can logout.   

### For Admin

• Admin can login to access the admin dashboard.
• After login, admin can:
    -View and manage user complaints.
    -Mark complaints as resolved.
    -View and analyze user feedback.
    -Register new employees into the system.
• Admin can logout.    

## Database Tables

• CLIENT
• ADMIN
• FEEDBACK
• Complaint_Category
• COMPLAINT

## Folder Structure

nagam/
├──backend/
|       ├──node_modules/
|       ├──public/
|       |      ├──a.html
|       |      ├──admin.html
|       |      ├──complaints.html
|       |      ├──feedback.html
|       |      ├──home.html
|       |      ├──auth.js
|       |      ├──admin.js
|       |      ├──jquery-3.6.0.min.js
|       |      ├──owl.carousel.min.css
|       |      ├──owl.carousel.min.js
|       |      ├──owl.theme.default.min.css
|       |      ├──complaint.js
|       |      ├──feedback.js
|       |      ├──complain_box/
|       |      └──complain_form/
|       |
|       ├──routes/
|       |     ├──admin.js
|       |     ├──complaints.js
|       |     ├──feedback.js
|       |     ├──authMiddleware.js
|       |     ├──email.js
|       |     └──user.js
|       |
|       ├──.env
|       ├──db.js
|       ├──server.js
|       ├──testemail.js
|       ├──package.json
|       └──package-lock.json
|
├──frontend/
|       ├──images/
|       ├──feedback.html
|       ├──g.html
|       ├──stray.html
|       ├──street.html
|       └──sewage.html


## Installation & Setup (on Virtual Machine)

1. **Copy Project to USB**
2. **Install VMBox & Load .OVA File**
3. **Extract Project in VM**
4. **Install Node.js and Required Dependencies**:
```bash
sudo apt update
sudo apt install nodejs npm
cd path_to_project_directory
npm install
```
5. **Run the Application**:
```bash
node backend/server.js
```
6. **Access via Browser**:
```
http://localhost8000:PORT ()
```

## Usage

### Users

• Visit Website: Users can visit website static pages and can access chatbot and other relevant information.
• Sign Up: New users must sign up using their First name,Last name,Phone number,email and password.
• Login: Only signed-up users can log in using their credentials.
• Home Page: After logging in, users are redirected back to the website Home page where they can register complaints and provide their  feedback.
• Submit Complaints: Users can select a complaint category (e.g., sewage, garbage, streetlight, stray animals) and enter Complaint Subject, Description, address and other required details.
• Feedback: After submitting a complaint, users can also provide feedback and rating as per their experience.
• Logout: User can logout.

### Admin

• Login: Admin logins by entering correct credentials.
• Dashboard: After logging in, admin is redirected to the admin dashboard where they can view, manage and resolve user complaints and view feedback and can also register new employees.
• Logout: Admin can logout.



## Security Features

• Admin/User authentication while login.
• Forgot password with OTP generation via E-mail.
• Role-based access for admin and user.
• Data validation at both frontend and backend.
• Secured database access using MYSQL.

## Future Enhancements

• Introduce Multilingual Support.
• Complaint Tracking System.
• Role-based employee access.












