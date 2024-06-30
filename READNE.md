# Jobee API

Jobee API is a Backend RESTful API for job seeking and posting. It is built in Node.js using Express.js and MongoDB.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Jobs](#jobs)
  - [Users](#users)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## Features

- Create and manage job postings
- Search for jobs by various criteria
- Authentication and authorization for employers and job seekers

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/jobee-api.git
    cd jobee-api
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the following:
    ```env
    NODE_ENV=development
    PORT=3000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    ```

4. Run the application:
    ```sh
    npm run dev
    ```

## Usage

- To start the server in development mode:
    ```sh
    npm run dev
    ```
- To start the server in production mode:
    ```sh
    npm start
    ```

## API Endpoints

### Jobs

#### Create new Job

- **Method:** POST
- **URL:** `/api/v1/job/new`
- **Description:** Create an ad job to DB. User must be authenticated and must be employer.

##### Request

- **Auth:** Bearer Token
- **Headers:**
  - Content-Type: application/json
- **Body:**
    ```json
    {
      "title": "Open position",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "email": "example@example.com",
      "address": "123 Example Street",
      "company": "Example Inc",
      "industry": ["Tech"],
      "jobType": "Permanent",
      "minEducation": "Bachelors",
      "experience": "2 years - 5 years",
      "salary": "50000"
    }
    ```

##### Response

- **Status:** 200 OK
- **Body:**
    ```json
    {
      "success": true,
      "message": "Job created successfully",
      "data": {
        "title": "Open position",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "email": "example@example.com",
        "address": "123 Example Street",
        "location": {
          "type": "Point",
          "coordinates": [18.11185, 59.32804],
          "formattedAddress": "123 Example Street, City, State, ZIP, Country",
          "city": "City",
          "state": "State",
          "zipcode": "ZIP",
          "country": "Country"
        },
        "company": "Example Inc",
        "industry": ["Tech"],
        "jobType": "Permanent",
        "minEducation": "Bachelors",
        "positions": 1,
        "experience": "2 years - 5 years",
        "salary": 50000,
        "lastDate": "2024-07-07T15:58:37.308Z",
        "applicantsApplied": [],
        "user": "user_id",
        "_id": "job_id",
        "postingDate": "2024-06-30T16:05:54.105Z",
        "slug": "open-position",
        "__v": 0
      }
    }
    ```

#### Get jobs by zipcode

- **Method:** GET
- **URL:** `/api/v1/jobs/:zipcode/:radius`
- **Description:** Get jobs in the area of the zipcode and radius informed.

##### Request

- **Headers:**
  - Content-Type: application/json

##### Response

- **Status:** 200 OK
- **Body:**
    ```json
    {
      "success": true,
      "results": 4,
      "data": [
        {
          "location": {
            "type": "Point",
            "coordinates": [18.11185, 59.32804],
            "formattedAddress": "123 Example Street, City, State, ZIP, Country",
            "city": "City",
            "state": "State",
            "zipcode": "ZIP",
            "country": "Country"
          },
          "_id": "job_id",
          "title": "Engineer",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "email": "example@example.com",
          "address": "123 Example Street",
          "company": "Example Inc",
          "industry": ["Tech"],
          "jobType": "Permanent",
          "minEducation": "Bachelors",
          "positions": 1,
          "experience": "2 years - 5 years",
          "salary": 50000,
          "lastDate": "2024-05-27T16:52:15.910Z",
          "user": "user_id",
          "postingDate": "2024-05-20T16:56:02.983Z",
          "slug": "engineer",
          "__v": 0
        }
      ]
    }
    ```

### Users

#### Register User

- **Method:** POST
- **URL:** `/api/v1/auth/register`
- **Description:** Register a new user.

##### Request

- **Headers:**
  - Content-Type: application/json
- **Body:**
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "role": "user"
    }
    ```

##### Response

- **Status:** 201 Created
- **Body:**
    ```json
    {
      "success": true,
      "token": "your_jwt_token"
    }
    ```

#### Login User

- **Method:** POST
- **URL:** `/api/v1/auth/login`
- **Description:** Login a user and get a token.

##### Request

- **Headers:**
  - Content-Type: application/json
- **Body:**
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```

##### Response

- **Status:** 200 OK
- **Body:**
    ```json
    {
      "success": true,
      "token": "your_jwt_token"
    }
    ```

#### Get Current Logged In User

- **Method:** GET
- **URL:** `/api/v1/auth/me`
- **Description:** Get current logged in user details.

##### Request

- **Auth:** Bearer Token
- **Headers:**
  - Content-Type: application/json

##### Response

- **Status:** 200 OK
- **Body:**
    ```json
    {
      "success": true,
      "data": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-06-30T16:05:54.105Z"
      }
    }
    ```

## Authentication

The API uses JWT for authentication. You need to include a Bearer token in the Authorization header for endpoints that require authentication.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or additions.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
