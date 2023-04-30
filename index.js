const express = require("express")
//to communicate with the dialogFlow
const dialog = require("dialogflow-fulfillment")
//to make the request to our api
const axios = require('axios')
//creating express app
const app = express()

//get the response to check if everything is okay
app.get("/", (req,res)=>{
    res.send("We are Live")    
})

//endpoint to handle webhook
app.post("/webhook", express.json(), (req,res)=>{
    try{
        //creating instance of webhook
        const agent = new dialog.WebhookClient({
            request: req,
            response: res
        })
        //our welcome intent
        function welcome(agent) {
            //sending the response to dialogflow
            agent.add(`Hi, This is Ali's bot. How can I help you?`);
        }
        //second intent
        function second(agent){
            //sending the response to dialogflow
            return agent.add("Can I get your status ID?");
        }
        //our third intent
        async function order(agent){
            //capturing the user provided order id
            const number = agent.parameters.number;
            //POST request to API and get the response
            const response = await axios.post('https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus', {
                orderId: number
            });
            //get the date from from api and save in shipmentDate
            const shipmentDate = response.data.shipmentDate;
            //creating the option, how we would like our date to be showing to end user
            const option = {weekday:"long", day: 'numeric', month: 'short', year: 'numeric'}
            //date instance and used locale method to get date in our preferable format
            const readableShipmentDate = new Date(shipmentDate).toLocaleDateString(undefined, option)
            //response to be sent
            const fulfillmentMessages = `Your order ${number} will be shipped on ${readableShipmentDate}.`;
            //sending the response to user about their query
            return agent.add(`${fulfillmentMessages}`)
        }
        function fourth(agent){
            //sending the response to dialogflow
            agent.add("Your Welcome!");
        }
        //mapping our intent using Map object
        let intentMap = new Map();
        //run the proper function handler
        intentMap.set('Default Welcome Intent', welcome);
        intentMap.set(`Second text`, second);
        intentMap.set('ThirdText', order);
        intentMap.set('Fourth text', fourth);
        //handling the request
        agent.handleRequest(intentMap);

    }catch (err) {
        // Send error response
        res.status(500).json(err);
      }
    
})

//express app port 3000
app.listen(3000, ()=>{console.log("Server is live at 3000")})