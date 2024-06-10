# Required Installations

- **NestJS**
- **Mongoose**

# Initial Configuration

1. Comment out the line that enables CORS in the production server to allow local consumption in the file `src/main.ts`:
    ```typescript
    // Comment this line:
    origin: ['https://chesscolate.com', 'https://www.chesscolate.com'],
    ```

# Generating Puzzle Files from Lichess .csv

### Step 1: Load Puzzles into MongoDB

1. Place the `.csv` file in the `assets` folder with the name `puzzles_upload.csv`.
2. Uncomment the `uploadPuzzles` method in the service `puzzles.service.ts` and the necessary imports.
3. Uncomment the necessary imports and configurations to initialize the Mongoose module in `src/puzzles/puzzles.module.ts`.
4. Uncomment the Mongoose imports in `app.module.ts`.
5. Create a `.env` file at the root of the project with the MongoDB connection string:
    ```env
    MONGO_URI=mongodb://localhost:27017/puzzles-db
    ```
6. Start the project with the command:
    ```bash
    npm run start:dev
    ```
7. Use Postman to send a POST request to the endpoint:
    ```plaintext
    http://[::1]:3000/puzzles/upload
    ```
    This will start uploading the puzzles to the MongoDB database. The console will notify when the process is complete.

### Step 2: Generate Puzzle Files by Themes and Openings

1. In the controller `src/puzzles/puzzles.controller.ts`, uncomment the `writeThemes` and `writeOpenings` methods.
2. In the service `src/puzzles/puzzles.service.ts`, enable the correct return for the `getPuzzlesByThemeFromDB` and `getPuzzlesByOpeningFromDB` methods.
3. Start the file generation process by sending POST requests to the following endpoints:
    - To generate files by themes:
      ```plaintext
      http://[::1]:3000/puzzles/write-themes
      ```
    - To generate files by openings:
      ```plaintext
      http://[::1]:3000/puzzles/write-openings
      ```

---