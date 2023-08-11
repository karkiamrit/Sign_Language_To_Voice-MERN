# Sing_Language_To_Voice-MERN
This is a full stack sign language to voice translation system tentatively designed to be used by government offices.
Process Flow: 
-Government Employee logins into system with his/her id and credentials.
-When a user arrives, S/He open the translation page and face the camera towards user.
-The user requests translation by showing the start gesture(here gesture class named as suruwat garnuhos).
-Once the start gesture is detected an input form pops up where user enters his/her username and also a photo of user is taken.
-User submits those details and begins translation.
-All gestures are translated every time user gives a gesture and speak button is pressed. (this is done as model is currently not stable so to prevent const misprediction speak button is kept to stabilize the response from model)
-This continues until User gives the stop gestures thats predefined.
-After this session ends and data of gestures is send to backend for admin viewing. 
-On press Speak again new session begins.

Model Used - Teachable machine Model 
Tech Stack Used- MERN, Flask (just for initial testing of model)
