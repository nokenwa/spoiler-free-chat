exports.handler = async function (context, event, callback) {
  const participants = event.participants;
  const twilioClient = context.getTwilioClient();

  try {
    await twilioClient.sync
      .services(context.SYNC_SERVICE_SID)
      .syncMaps.create({ uniqueName: 'participants' })

    Promise.all(
      participants.map(async participant => {
        try {
          await twilioClient.sync
            .services(context.SYNC_SERVICE_SID)
            .syncMaps('participants')
            .syncMapItems
            .create({
              key: participant.name,
              data: {
                name: participant.name,
                tel: participant.tel,
                show: true
              }
            })

          await twilioClient.sync
            .services(context.SYNC_SERVICE_SID)
            .syncLists.create({ uniqueName: participant.name })

          return twilioClient.messages.create({
            to: participant.tel,
            from: context.TWILIO_NUMBER,
            body: `You've been added to a spoiler free chat. Here are some instructions \n \n /hide: will pause all messages that may contain spoilers \n \n /show:  will retrieve all your saved messages and forward all new messages straight to you.`
          })
        } catch (error) {
          console.log('error.message')
          callback(error.message)
        }

      })
    ).then(results => {
      console.log('success');
      callback(null, 'success');
    }).catch(error => {
      console.log(error.message)
      callback(error.message)
    })
  } catch (error) {
    console.log(error.message)
    callback(error.message)
  }
}
