# Todo-App
Learning how to use Supabase

## ==========DEV LOGs===========
### 2025/12/06
- Fixed the session problem whereupon logging in, the app creates a JSESSIONID and send it to the back end containing account data. But when refreshing the page (F5), the frontend got reset completely and forgets the JSESSIONID existed, although it still there in the app.
  - Fixed by adding a get mapping /me in account controller to send out the account and catch in on the frontend by a checkSession() function.
- Minor change to the frontend (color, script's name)
- Added custom logout function in the controller
