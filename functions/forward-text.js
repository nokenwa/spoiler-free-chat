exports.handler = async function (context, event, callback) {
  const fs = require('fs');
  const messageBody = event.Body;
  const twilioClient = context.getTwilioClient();
  console.log(Runtime.getAssets());
  const twiml = new Twilio.twiml.MessagingResponse();
 
  const participants = await twilioClient.sync.services(context.SYNC_SERVICE_SID)
    .syncMaps('participants')
    .syncMapItems
    .list({ limit: 20 });
  

  const sender = participants.filter(participant => {
    return participant.data.tel === event.From;
  })[0].data;

  const recipients = participants.filter(participant => {
    return participant.data.tel !== event.From;
  });
  
  if (sender.length === 0) {
    twiml.message(`You're not on the participants list. Please contact the chat admin to be added.`)
    callback(null, twiml)
  }

  //CHECK FOR COMMANDS
  if (messageBody.charAt(0) === "/") {
    switch (messageBody) {
      case "/hide":
        hideSpoilers()
        async function hideSpoilers() {
          console.log(sender.name)
          let recipientSync = await twilioClient.sync.services(context.SYNC_SERVICE_SID)
            .syncMaps('participants')
            .syncMapItems(sender.name)
            .update({
              data: {
                "name": sender.name,
                "tel": sender.tel,
                "show": false
              }
            })
            twiml.message(`Okay, I'll hide any new messages until you ask me to show them. You can unhide messages with the command /show`);
            callback(null, twiml)
        }
        break;
      case "/show":
        showSpoilers()
        async function showSpoilers() {
          let recipientSync = await twilioClient.sync.services(context.SYNC_SERVICE_SID)
            .syncMaps('participants')
            .syncMapItems(sender.name)
            .update({
              data: {
                "name": sender.name,
                "tel": sender.tel,
                "show": true
              }
            })
          
          let heldMessages = await twilioClient.sync
            .services(context.SYNC_SERVICE_SID)
            .syncLists(sender.name)
            .syncListItems
            .list()
          
          Promise.all(
            heldMessages.map(message => {
              return twilioClient.messages.create({
                to: sender.tel,
                from: event.To,
                body: `${message.data.from}: ${message.data.body}`
              })
            })
          ).then((results) => {
            return heldMessages.map(message => {
              twilioClient.sync.services(context.SYNC_SERVICE_SID)
                .syncLists(sender.name)
                .syncListItems(message.index)
                .remove()
            })
          }).then((results)=>{
            twilioClient.messages.create({
              to: sender.tel,
              from: event.To,
              body: `Here are your messages.`
            })
          })
              .catch((err) => {
                console.log(err);
                callback(error);
              });
        }
        break;
      default:
        break;
    }
  }

  Promise.all(
    recipients.map(async (recipient) => {
      let recipientSync = await twilioClient.sync.services(context.SYNC_SERVICE_SID)
        .syncMaps('participants')
        .syncMapItems(recipient.data.name)
        .fetch();
      if (recipientSync.data.show) {
        return twilioClient.messages.create({
        to: recipient.data.tel,
        from: event.To,
        body: `${sender.name}: ${messageBody}`
      });
      } else {
        return twilioClient.sync
          .services(context.SYNC_SERVICE_SID)
          .syncLists(recipient.data.name)
          .syncListItems.create({
            data: {
              body: messageBody,
              from: sender.name
            }
          });
      }
      
    })
  )
    .then((results) => {
      console.log('success');
      callback()
    })
    .catch((err) => {
      console.log(err);
      callback(error);
    });
};
