# **App Name**: Breed Guru

## Core Features:

- Image Upload & Prediction: Allow the FLW to upload a photo of a cow/buffalo, send it to the backend for breed prediction, and show the top 3 predicted breeds with confidence scores.
- Breed Description: Use a generative AI tool to fetch a concise description of the predicted breed, covering origin, key traits, and milk yield. Display this information to the user. The LLM will use a tool to retrieve structured breed metadata from the backend in order to build a response.
- Translation: Offer the ability to translate the breed description into local languages (English and Hindi).
- Manual Correction: Provide a dropdown menu to manually correct the breed if the AI prediction is incorrect. Store the corrections for model retraining.
- Image Quality Check: Perform a basic check on the uploaded image for blurriness or darkness, and display a warning message if the image quality is poor.
- API Endpoint: Provide a REST API endpoint to classify an image. The image file is expected in the multipart/form-data format. This endpoint provides integration with other applications like the Bharat Pashudhan App (BPA).

## Style Guidelines:

- Background color: Light beige (#F5F5DC) to provide a neutral and clean backdrop.
- Primary color: Olive green (#808000) representing nature, health, and reliability. A less saturated tone aligns well with the app’s purpose in animal husbandry.
- Accent color: Golden yellow (#FFD700) to highlight key interactive elements and calls to action. This analogous hue to the primary olive, shifted to a slightly warmer range.
- Employ a mobile-first, single-column layout for ease of use on various devices. Prioritize key information (breed predictions, confidence scores) at the top.
- Body and headline font: 'PT Sans', a humanist sans-serif, will be used for both body text and headings to offer a modern yet welcoming feel, which is easy to read for users of varying literacy levels.
- Use simple, easily recognizable icons related to cattle and buffalo breeds. Ensure icons are distinct and intuitive for users with varying levels of literacy.
- Use subtle animations (e.g., loading spinners, progress bars) during image upload and processing to provide feedback without overwhelming the user.