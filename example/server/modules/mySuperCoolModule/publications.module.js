
Meteor.publish(settings.__name__ + '/documents', function () {
  return MySuperCoolModule.documents.find({});
});
