# SEG3125-lab5-Group05
This is lab 5

This is an improvement of lab 4, keeping all the requriements from lab 4, we will add the requirements for lab 5

The contributions were equal, the repository will be posted in the GitHub classroom of the course, and the personal repository is Stfeng333... https://github.com/Stfeng333/SEG3125--labs-group05 

The website itself is published by Sahara at... 

new features added (based on Don Norman's Design Principles):

**Feedback**
- All warning and error messages are now shown as animated toast notifications in the corner of the screen
- Clicking a service or staff card triggers a brief pulse animation on the card to confirm the selection was registered
- Every contact form field in Step 4 turns green when filled correctly and red when input is invalid, updating live as the user types
- A live progress message below the contact form tells the user exactly which fields are still missing before they can continue
- The Submit button shows a loading spinner while the booking is being processed
- An accessibility live region silently announces all major state changes to screen reader users throughout the booking process

**Visibility**
- Each disabled "Next" button permanently displays a short hint explaining what the user must do to unlock it
- Completed steps in the progress bar are marked with a green checkmark
- Steps not yet reached are visually dimmed

**Affordance**
- The phone number field shows a placeholder example, limits input to 10 characters, and activates a numeric keyboard on mobile devices
- Required fields are labeled with asterisks or parenthetical notes so users know the rules before they start filling the form
- Name, email, and phone fields support browser autofill and password manager suggestions to reduce manual typing effort

**Mapping**
- After choosing a service, technicians whose expertise matches that service are automatically highlighted with a "Recommended" badge
- Completed step labels in the progress bar become clickable links, allowing users to jump back to any previous step without using the Back button

**Consistency**
- All validation warnings across every step of the form use the same toast notification style
- All contact form fields follow the same visual structure

**Constraints**
- The "previous month" arrow on the date picker calendar is disabled when the user is already viewing the current month
- The phone number field automatically removes any non-numeric characters as the user types, making it impossible to enter an incorrectly formatted number

---
