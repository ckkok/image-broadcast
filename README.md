# Image Broadcaster

A scrappy tool for letting streamers (e.g. Twitch) get images quickly from their audiences, quickly cobbled together using Node and Express.

Image upload can be done via mobile devices directly from camera, or desktop via the file selector.

The streamer controls the upload via a key that requires admin login to view. The key changes once an image has been uploaded.

The audience member uploads the image with the key. Incorrect keys will result in a rejected upload.

By design, only 1 image is stored on the server at any one time.

# Routes
- (Public) `/` : Shows the image upload form
- (Public) `/login` : Admin login
- (Private) `/key` : Shows the current key
- (Private) `/last` : Shows the current picture

# Instructions
Ensure that `.env` is present in the root directory, and that `ADMIN_PASSWORD` and `ADMIN_KEY` have been configured in it. `ADMIN_PASSWORD` is used for logging in.

Start the project with `npm run dev`. This project currently uses ES6 modules, hence the `.mjs` files and the `--experimental-modules` flag.