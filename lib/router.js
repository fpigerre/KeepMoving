Router.route('/', function () {
    // render the Authentication template with a custom data context
    this.render('authentication', {data: {title: 'KM &middot Sign In'}});
});

Router.route('/events', function () {
    this.render('index', {data: {title: 'Keep Moving'}});
});

Router.route('/events/:_id', function () {
    var event = Events.findOne({_id: this.params._id});
    this.render('ShowEvent', {data: event});
});